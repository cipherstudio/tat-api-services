import { Injectable } from '@nestjs/common';
import { KnexBaseRepository } from '../../../common/repositories/knex-base.repository';
import { KnexService } from '../../../database/knex-service/knex.service';
import { toSnakeCase } from '../../../common/utils/case-mapping';
import { ClothingExpenseCancellationRequest } from '../entities/clothing-expense-cancellation-request.entity';

@Injectable()
export class ClothingExpenseCancellationRequestRepository extends KnexBaseRepository<ClothingExpenseCancellationRequest> {
  constructor(knexService: KnexService) {
    super(knexService, 'clothing_expense_cancellation_requests');
  }

  async findWithPaginationAndSearch(
    page: number = 1,
    limit: number = 10,
    conditions: Record<string, any> = {},
    orderBy: string = 'created_at',
    direction: 'asc' | 'desc' = 'desc',
    currentEmployeeId?: number,
  ) {
    const searchTerm =
      typeof conditions.search === 'string' ? conditions.search.trim() : '';

    const filter = { ...conditions };
    delete filter.page;
    delete filter.limit;
    delete filter.order_by;
    delete filter.direction;
    delete filter.search;
    delete filter.isRelateToMe;
  
    const dbFilter = await toSnakeCase(filter);
    const offset = ((page || 1) - 1) * (limit || 10);
  
     let baseQuery = this.knex('clothing_expense_cancellation_requests')
       .leftJoin('approval as a', 'clothing_expense_cancellation_requests.approval_id', 'a.id')
       .leftJoin('files as f', 'clothing_expense_cancellation_requests.attachment_id', 'f.id');
  
    // Apply filters
    if (Object.keys(dbFilter).length > 0) {
      Object.entries(dbFilter).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '' && !Number.isNaN(value)) {
          baseQuery = baseQuery.where(`clothing_expense_cancellation_requests.${key}`, value);
        }
      });
    }
  
     if (conditions.isRelateToMe === true && currentEmployeeId) {
       const employeeCode = String(currentEmployeeId).trim();
       baseQuery = baseQuery.where(function() {
         this.where(
           'clothing_expense_cancellation_requests.creator_code',
           employeeCode,
         ).orWhereExists(function() {
           this.select(1)
             .from('approval_staff_members as asm')
             .whereRaw(
               '"asm"."approval_id" = "clothing_expense_cancellation_requests"."approval_id"',
             )
             .whereRaw(
               'RTRIM(CAST("asm"."employee_code" AS VARCHAR2(255))) = ?',
               [employeeCode],
             )
             .whereRaw(
               '"clothing_expense_cancellation_requests"."selected_staff_ids" LIKE \'%\' || CAST("asm"."id" AS VARCHAR2(20)) || \'%\'',
             );
         });
       });
     }

    this.applySearchTerm(baseQuery, searchTerm);
    // Query for total count
    const countResult = await baseQuery
      .clone()
      .count('clothing_expense_cancellation_requests.id as count')
      .first();
    const total = Number(countResult?.count || 0);
  
          // Query for data with pagination
      const data = await baseQuery
        .clone()
        .select([
          'clothing_expense_cancellation_requests.*',
          'a.travel_type as approval_travel_type',
          'a.increment_id as approval_increment_id',
          'a.document_title as approval_document_title',
          'f.original_name as attachment_original_name',
          'f.file_name as attachment_file_path',
        ])
        .orderBy(`clothing_expense_cancellation_requests.${orderBy}`, direction)
        .limit(limit || 10)
        .offset(offset);

      // ดึงข้อมูล approval_clothing_expense แยกต่างหาก
      const dataWithClothingExpenses = await Promise.all(
        data.map(async (item) => {
          const selectedStaffMemberIds = this.parseSelectedStaffIds(
            item.selected_staff_ids,
          );

          const clothingExpenses = await this.fetchClothingExpensesForCancellation(
            item.approval_id,
            selectedStaffMemberIds,
            conditions.isRelateToMe !== true,
          );

          const primaryExpense = this.pickPrimaryClothingExpense(
            clothingExpenses,
            selectedStaffMemberIds,
          );

          const cancelledStaffName = await this.resolveCancelledStaffName(
            item.approval_id,
            selectedStaffMemberIds,
            primaryExpense,
          );

          return {
            ...item,
            clothing_expenses: clothingExpenses,
            clothing_expense_id: primaryExpense?.id ?? null,
            clothing_employee_code: primaryExpense?.employee_code ?? null,
            clothing_amount: primaryExpense?.clothing_amount ?? null,
            clothing_reason: primaryExpense?.clothing_reason ?? null,
            clothing_destination_country: primaryExpense?.destination_country ?? null,
            clothing_work_start_date: primaryExpense?.work_start_date ?? null,
            clothing_work_end_date: primaryExpense?.work_end_date ?? null,
            cancelled_staff_name: cancelledStaffName,
          };
        }),
      );
  
          return {
        data: dataWithClothingExpenses,
        meta: {
          total,
          page,
          limit,
          lastPage: Math.ceil(total / limit),
        },
      };
  }

  async findOne(
    conditions: Record<string, any>,
  ): Promise<ClothingExpenseCancellationRequest | null> {
    const transformedConditions: Record<string, any> = {};
    Object.entries(conditions).forEach(([key, value]) => {
      if (key === 'id') {
        transformedConditions['cecr.id'] = value;
      } else {
        transformedConditions[`cecr.${key}`] = value;
      }
    });

    const result = await this.knex('clothing_expense_cancellation_requests as cecr')
      .leftJoin('approval as a', 'cecr.approval_id', 'a.id')
      .leftJoin('files as f', 'cecr.attachment_id', 'f.id')
      .leftJoin('approval_clothing_expense as ace', 'cecr.approval_id', 'ace.approval_id')
      .select([
        'cecr.*',
        'a.document_title as approval_document_title',
        'a.increment_id as approval_increment_id',
        'f.original_name as attachment_original_name',
        'f.file_name as attachment_file_path',
        'ace.id as clothing_expense_id',
        'ace.employee_code as clothing_employee_code',
        'ace.clothing_amount as clothing_amount',
        'ace.clothing_reason as clothing_reason',
        'ace.destination_country as clothing_destination_country',
        'ace.work_start_date as clothing_work_start_date',
        'ace.work_end_date as clothing_work_end_date',
      ])
      .where(transformedConditions)
      .first();

    if (!result) {
      return null;
    }

    const selectedStaffMemberIds = this.parseSelectedStaffIds(
      result.selected_staff_ids as unknown as string,
    );

    let primaryForName: { staff_member_id?: number | null } | null = null;
    if (result.clothing_expense_id) {
      primaryForName = await this.knex('approval_clothing_expense')
        .select('staff_member_id')
        .where('id', result.clothing_expense_id)
        .first();
    }

    const cancelledStaffName = await this.resolveCancelledStaffName(
      result.approval_id,
      selectedStaffMemberIds,
      primaryForName,
    );

    return { ...result, cancelled_staff_name: cancelledStaffName };
  }

  private parseSelectedStaffIds(raw?: string | null): string[] {
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed
        .filter(
          (s: unknown) =>
            s != null && String(s).trim() !== '' && String(s) !== 'null',
        )
        .map((s: unknown) => String(s));
    } catch {
      return [];
    }
  }

  private clothingExpenseSelectFields() {
    return [
      'id',
      'clothing_file_checked',
      'clothing_amount',
      'clothing_reason',
      'reporting_date',
      'next_claim_date',
      'work_start_date',
      'work_end_date',
      'created_at',
      'updated_at',
      'staff_member_id',
      'approval_id',
      'employee_code',
      'increment_id',
      'destination_country',
    ];
  }

  /** ดึงรายการค่าเครื่องแต่งตัว — รองรับ selected_staff_ids แบบ staff_member.id และ employee_code เก่า */
  private async fetchClothingExpensesForCancellation(
    approvalId: number,
    selectedIds: string[],
    filterForAdmin: boolean,
  ): Promise<any[]> {
    const baseQuery = () =>
      this.knex('approval_clothing_expense')
        .select(this.clothingExpenseSelectFields())
        .where('approval_id', approvalId);

    if (!filterForAdmin || selectedIds.length === 0) {
      return baseQuery();
    }

    const numericIds = selectedIds
      .map((id) => Number(id))
      .filter((n) => !Number.isNaN(n));

    if (numericIds.length > 0) {
      const byStaffMemberId = await baseQuery().whereIn(
        'staff_member_id',
        numericIds,
      );
      if (byStaffMemberId.length > 0) return byStaffMemberId;
    }

    const byEmployeeCode = await baseQuery().whereIn(
      'employee_code',
      selectedIds,
    );
    if (byEmployeeCode.length > 0) return byEmployeeCode;

    return baseQuery();
  }

  private pickPrimaryClothingExpense(
    clothingExpenses: any[],
    selectedIds: string[],
  ): any | null {
    if (clothingExpenses.length === 0) return null;
    if (selectedIds.length === 0) return clothingExpenses[0];

    const byStaffMemberId = clothingExpenses.find((e) =>
      selectedIds.includes(String(e.staff_member_id)),
    );
    if (byStaffMemberId) return byStaffMemberId;

    const byEmployeeCode = clothingExpenses.find((e) =>
      selectedIds.includes(String(e.employee_code)),
    );
    if (byEmployeeCode) return byEmployeeCode;

    return clothingExpenses[0];
  }

  private async resolveCancelledStaffName(
    approvalId: number,
    selectedIds: string[],
    primaryExpense?: { staff_member_id?: number | null } | null,
  ): Promise<string | null> {
    if (selectedIds.length > 0) {
      const numericIds = selectedIds
        .map((id) => Number(id))
        .filter((n) => !Number.isNaN(n));

      if (numericIds.length > 0) {
        const byId = await this.knex('approval_staff_members')
          .select('name')
          .where('approval_id', approvalId)
          .whereIn('id', numericIds);
        const namesById = byId
          .map((r: { name?: string }) => r.name)
          .filter((n): n is string => !!n);
        if (namesById.length > 0) return namesById.join(', ');
      }

      const byCode = await this.knex('approval_staff_members')
        .select('name')
        .where('approval_id', approvalId)
        .whereIn('employee_code', selectedIds);
      const namesByCode = byCode
        .map((r: { name?: string }) => r.name)
        .filter((n): n is string => !!n);
      if (namesByCode.length > 0) return namesByCode.join(', ');
    }

    if (primaryExpense?.staff_member_id) {
      const staffRow = await this.knex('approval_staff_members')
        .select('name')
        .where('id', primaryExpense.staff_member_id)
        .first();
      return staffRow?.name ?? null;
    }

    return null;
  }

  private applySearchTerm(query: any, searchTerm?: string) {
    if (!searchTerm) return;

    query.where(function () {
      this.where('a.increment_id', 'like', `%${searchTerm}%`)
        .orWhere(
          'clothing_expense_cancellation_requests.creator_name',
          'like',
          `%${searchTerm}%`,
        )
        .orWhere(
          'clothing_expense_cancellation_requests.creator_code',
          'like',
          `%${searchTerm}%`,
        )
        .orWhere('a.document_title', 'like', `%${searchTerm}%`);
    });
  }
}
