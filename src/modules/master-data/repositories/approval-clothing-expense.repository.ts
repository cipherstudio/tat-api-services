import { Injectable } from '@nestjs/common';
import { KnexBaseRepository } from '../../../common/repositories/knex-base.repository';
import { KnexService } from '../../../database/knex-service/knex.service';
import { toSnakeCase } from '../../../common/utils/case-mapping';
import { ApprovalClothingExpense } from '../entities/approval-clothing-expense.entity';

@Injectable()
export class ApprovalClothingExpenseRepository extends KnexBaseRepository<ApprovalClothingExpense> {
  constructor(knexService: KnexService) {
    super(knexService, 'approval_clothing_expense');
  }

  async findWithPaginationAndSearch(
    page: number = 1,
    limit: number = 10,
    conditions: Record<string, any> = {},
    orderBy: string = 'created_at',
    direction: 'asc' | 'desc' = 'desc',
    searchTerm?: string,
  ) {
    const filter = { ...conditions };
    delete filter.page;
    delete filter.limit;
    delete filter.order_by;
    delete filter.direction;
    delete filter.search;
    delete filter.beneficiary_only;
    delete filter.include_cancelled;
    delete filter.group_by_approval;

    const groupByApproval = conditions.group_by_approval === true;

    const dbFilter = await toSnakeCase(filter);
    const offset = (page - 1) * limit;

    const buildBaseQuery = () => {
      const query = this.knex('approval_clothing_expense as ace')
        .leftJoin(
          this.knex
            .distinct([
              'PMT_CODE',
              'PMT_NAME_T',
              'PMT_NAME_E',
              'PMT_POS_WK',
              'PMT_CUR_FAC',
              'PMT_EMAIL_ADDR',
            ])
            .from('OP_MASTER_T')
            .as('omt'),
          'ace.employee_code',
          'omt.PMT_CODE',
        )
        .leftJoin('approval_staff_members as asm', 'ace.staff_member_id', 'asm.id')
        .leftJoin('approval as a', 'ace.approval_id', 'a.id')
        .leftJoin(
          this.knex('approval_status_history')
            .select('approval_id')
            .max('created_at as approval_approved_date')
            .where('approval_status_label_id', 3)
            .groupBy('approval_id')
            .as('approved_hist'),
          'a.id',
          'approved_hist.approval_id',
        );

      // Apply filters
      this.applyFilters(query, dbFilter, conditions);
      // Apply search term
      this.applySearchTerm(query, searchTerm);
      
      return query;
    };

    const selectColumns = [
      'ace.*',
      'omt.PMT_CODE as employee_pmt_code',
      'omt.PMT_NAME_T as employee_name_th',
      'omt.PMT_NAME_E as employee_name_en',
      'asm.name as staff_member_name',
      'omt.PMT_POS_WK as employee_position',
      'omt.PMT_CUR_FAC as employee_faculty',
      'omt.PMT_EMAIL_ADDR as employee_email',
      'a.travel_type as approval_travel_type',
      'a.created_employee_code as requestor_code',
      'a.created_employee_name as requestor_name',
      'a.approval_date as approval_request_date',
      'a.document_title as document_title',
      'approved_hist.approval_approved_date',
    ];

    // Query for total count
    const countResult = await (groupByApproval
      ? buildBaseQuery().countDistinct('ace.approval_id as count')
      : buildBaseQuery().count('ace.id as count')
    ).first();
    const total = Number(countResult?.count || 0);

    // Query for data with pagination
    let data;
    if (groupByApproval) {
      // หน้ารายการเบิกค่าเครื่องแต่งตัว: 1 แถวต่อ 1 ใบอนุมัติ (เลขที่หนังสือไม่ซ้ำ)
      // เลือก ace ตัวแทน (id มากสุด) ต่อ approval ด้วย ROW_NUMBER แล้ว paginate ตามจำนวนใบ
      const inner = buildBaseQuery().select([
        ...selectColumns,
        this.knex.raw(
          'ROW_NUMBER() OVER (PARTITION BY "ace"."approval_id" ORDER BY "ace"."id" DESC) as "rn"',
        ),
      ]);
      data = await this.knex
        .select('*')
        .from(inner.as('grouped'))
        .where('rn', 1)
        .orderBy(orderBy, direction)
        .limit(limit)
        .offset(offset);
    } else {
      data = await buildBaseQuery()
        .select(selectColumns)
        .orderBy(`ace.${orderBy}`, direction)
        .limit(limit)
        .offset(offset);
    }

    for (const item of data) {
      if (item.employee_name_th == null && item.staff_member_name != null) {
        item.employee_name_th = item.staff_member_name;
      }
      if (item.employee_name_en == null && item.staff_member_name != null) {
        item.employee_name_en = item.staff_member_name;
      }
      delete item.staff_member_name;

      const clothingAmounts = await this.knex('approval_clothing_expense')
        .select('clothing_amount')
        .where('approval_id', item.approval_id);
      
      const totalAmount = clothingAmounts.reduce((sum, record) => sum + (record.clothing_amount || 0), 0);
      item.approval_total_clothing_amount = totalAmount;
    }

    return {
      data,
      meta: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  private applyFilters(
    query: any,
    dbFilter: Record<string, any>,
    conditions: Record<string, any> = {},
  ) {
    // flag พิเศษ (ไม่ใช่คอลัมน์ DB) — แบบเดียวกับ isRelateToMe ใน clothing-expense-cancellation-request
    if (conditions.include_cancelled !== true) {
      query.where('ace.is_cancelled', false);
    }

    if (Object.keys(dbFilter).length > 0) {
      Object.entries(dbFilter).forEach(([key, value]) => {
        if (this.isValidFilterValue(value)) {
          if (key === 'is_overdue') {
            this.applyOverdueFilter(query, value);
          } else if (key === 'employee_code') {
            if (conditions.beneficiary_only === true) {
              this.applyBeneficiaryOnlyFilter(query, String(value).trim());
            } else {
              this.applyEmployeeAccessFilter(query, String(value).trim());
            }
          } else if (key === 'requestor_employee_code') {
            this.applyRequestorEmployeeFilter(query, String(value).trim());
          } else if (key === 'approval_request_date') {
            this.applyDateEqualsFilter(query, '"a"."approval_date"', String(value));
          } else if (key === 'next_claim_date') {
            this.applyDateEqualsFilter(query, '"ace"."next_claim_date"', String(value));
          } else {
            query.where(`ace.${key}`, value);
          }
        }
      });
    }
  }

  /** ประวัติส่วนตัว — เฉพาะแถวที่ employee_code ตรงกับผู้ใช้ */
  private applyBeneficiaryOnlyFilter(query: any, employeeCode: string) {
    query.whereRaw('RTRIM(CAST("ace"."employee_code" AS VARCHAR2(255))) = ?', [
      employeeCode,
    ]);
  }

  /** ผู้มีสิทธิ์เห็น: เจ้าของรายการ หรือ ผู้สร้าง/เจ้าของใบอนุมัติ */
  private applyEmployeeAccessFilter(query: any, employeeCode: string) {
    query.where(function () {
      this.whereRaw('RTRIM(CAST("ace"."employee_code" AS VARCHAR2(255))) = ?', [
        employeeCode,
      ])
        .orWhere('a.created_employee_code', employeeCode)
        .orWhere('a.employee_code', employeeCode)
        .orWhere('a.continuous_employee_code', employeeCode);
    });
  }

  /** กรองตามผู้สร้างใบอนุมัติ — เห็นทุกรายการค่าเครื่องแต่งตัวในใบที่ตัวเองสร้าง */
  private applyRequestorEmployeeFilter(query: any, employeeCode: string) {
    query.where(function () {
      this.where('a.created_employee_code', employeeCode)
        .orWhere('a.employee_code', employeeCode)
        .orWhere('a.continuous_employee_code', employeeCode);
    });
  }

  private isValidFilterValue(value: any): boolean {
    return value !== undefined && 
           value !== null && 
           value !== '' && 
           !Number.isNaN(value);
  }

  /** กรองวันที่แบบเทียบเฉพาะวัน (Oracle TRUNC) */
  private applyDateEqualsFilter(
    query: any,
    quotedColumn: string,
    rawDate: string,
  ) {
    const dateOnly = rawDate.split('T')[0];
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) {
      return;
    }
    query.whereRaw(`TRUNC(${quotedColumn}) = TO_DATE(?, 'YYYY-MM-DD')`, [
      dateOnly,
    ]);
  }

  private applyOverdueFilter(query: any, isOverdue: boolean) {
    const today = new Date().toISOString().split('T')[0];

    if (isOverdue === true) {
      query.where('a.approval_status_label_id', 3);
      query.where('ace.work_start_date', '<', today);
    } else if (isOverdue === false) {
      query.where(function() {
        this.where('ace.next_claim_date', '>', today).orWhereNull(
          'ace.next_claim_date',
        );
      });

      // ซ่อนเฉพาะรายการค่าเครื่องแต่งตัวของคนที่มีคำขอยกเลิก pending แล้ว
      // (ไม่ซ่อนทั้งใบอนุมัติ — ให้ยกเลิกคนอื่นในใบเดียวกันต่อได้)
      query.whereNotExists(function () {
        this.select(1)
          .from('clothing_expense_cancellation_requests as cecr')
          .whereRaw('"cecr"."approval_id" = "ace"."approval_id"')
          .where('cecr.status', 'pending')
          .where(function () {
            this.whereRaw(
              '"cecr"."selected_staff_ids" LIKE \'%\' || CAST("ace"."staff_member_id" AS VARCHAR2(20)) || \'%\'',
            ).orWhereRaw(
              '"cecr"."selected_staff_ids" LIKE \'%\' || RTRIM(CAST("ace"."employee_code" AS VARCHAR2(255))) || \'%\'',
            );
          });
      });
    }
  }

  private applySearchTerm(query: any, searchTerm?: string) {
    if (searchTerm && searchTerm.trim() !== '') {
      const searchTerm_clean = searchTerm.trim();
      const knex = this.knex;

      query.where(function () {
        this.where('omt.PMT_NAME_T', 'like', `%${searchTerm_clean}%`)
            .orWhere('omt.PMT_NAME_E', 'like', `%${searchTerm_clean}%`)
            .orWhere('ace.employee_code', 'like', `%${searchTerm_clean}%`)
            .orWhere('omt.PMT_CODE', 'like', `%${searchTerm_clean}%`)
            .orWhere('ace.increment_id', 'like', `%${searchTerm_clean}%`)
            .orWhere(knex.raw('"asm"."name" LIKE ?', [`%${searchTerm_clean}%`]));
      });
    }
  }

  async findOne(conditions: Record<string, any>): Promise<any | null> {
    const transformedConditions: Record<string, any> = {};
    Object.entries(conditions).forEach(([key, value]) => {
      if (key === 'id') {
        transformedConditions['ace.id'] = value;
      } else {
        transformedConditions[`ace.${key}`] = value;
      }
    });

    const result = await this.knex('approval_clothing_expense as ace')
      .leftJoin(
        this.knex
          .distinct([
            'PMT_CODE',
            'PMT_NAME_T',
            'PMT_NAME_E',
            'PMT_POS_WK',
            'PMT_CUR_FAC',
            'PMT_EMAIL_ADDR',
          ])
          .from('OP_MASTER_T')
          .as('omt'),
        'ace.employee_code',
        'omt.PMT_CODE',
      )
      .leftJoin('approval_staff_members as asm', 'ace.staff_member_id', 'asm.id')
      .leftJoin('approval as a', 'ace.approval_id', 'a.id')
      .leftJoin(
        this.knex('approval_status_history')
          .select('approval_id')
          .max('created_at as approval_approved_date')
          .where('approval_status_label_id', 3)
          .groupBy('approval_id')
          .as('approved_hist'),
        'a.id',
        'approved_hist.approval_id',
      )
      .select([
        'ace.*',
        'omt.PMT_CODE as employee_pmt_code',
        'omt.PMT_NAME_T as employee_name_th',
        'omt.PMT_NAME_E as employee_name_en',
        'asm.name as staff_member_name',
        'omt.PMT_POS_WK as employee_position',
        'omt.PMT_CUR_FAC as employee_faculty',
        'omt.PMT_EMAIL_ADDR as employee_email',
        'a.travel_type as approval_travel_type',
        'a.created_employee_code as requestor_code',
        'a.created_employee_name as requestor_name',
        'a.approval_date as approval_request_date',
        'a.document_title as document_title',
        'approved_hist.approval_approved_date',
      ])
      .where(transformedConditions)
      .where('ace.is_cancelled', false)
      .first();

    if (result) {
      if (result.employee_name_th == null && result.staff_member_name != null) {
        result.employee_name_th = result.staff_member_name;
      }
      if (result.employee_name_en == null && result.staff_member_name != null) {
        result.employee_name_en = result.staff_member_name;
      }
      delete result.staff_member_name;

      const clothingAmounts = await this.knex('approval_clothing_expense')
        .select('clothing_amount')
        .where('approval_id', result.approval_id);
      
      const totalAmount = clothingAmounts.reduce((sum, record) => sum + (record.clothing_amount || 0), 0);
      result.approval_total_clothing_amount = totalAmount;
    }

    return result || null;
  }
}