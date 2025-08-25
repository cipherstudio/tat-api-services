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
  ) {
    const filter = { ...conditions };
    delete filter.page;
    delete filter.limit;
    delete filter.order_by;
    delete filter.direction;
    delete filter.search;

    const dbFilter = await toSnakeCase(filter);
    const offset = (page - 1) * limit;

    // Query for total count
    let baseQuery = this.knex('approval_clothing_expense as ace')
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
      .leftJoin(
        'approval as a',
        'ace.approval_id',
        'a.id',
      );

      if (Object.keys(dbFilter).length > 0) {
       Object.entries(dbFilter).forEach(([key, value]) => {
         if (value !== undefined && value !== null && value !== '' && !Number.isNaN(value)) {
            if (key === 'is_overdue') {
              baseQuery.where('a.approval_status_label_id', 3);
              const today = new Date().toISOString().split('T')[0]; 
              if (value === true) {
                baseQuery.where('ace.work_start_date', '<', today);
              } else if (value === false) {
                baseQuery.where(function() {
                  this.where('ace.work_start_date', '>=', today)
                       .orWhereNull('ace.work_start_date');
                });
                
                 baseQuery.whereNotIn('ace.approval_id', function() {
                   this.select('approval_id')
                     .from('clothing_expense_cancellation_requests')
                     .where('status', 'pending');
                 });
            }
            } else {
             baseQuery.where(`ace.${key}`, value);
            }
         }
       });
     }

    const countResult = await baseQuery
      .clone()
      .count('ace.id as count')
      .first();
    const total = Number(countResult?.count || 0);

    // Query for data with pagination
    const data = await baseQuery
      .clone()
      .select([
        'ace.*',
        'omt.PMT_CODE as employee_pmt_code',
        'omt.PMT_NAME_T as employee_name_th',
        'omt.PMT_NAME_E as employee_name_en',
        'omt.PMT_POS_WK as employee_position',
        'omt.PMT_CUR_FAC as employee_faculty',
        'omt.PMT_EMAIL_ADDR as employee_email',
        'a.travel_type as approval_travel_type',
        'a.created_employee_code as requestor_code',
        'a.created_employee_name as requestor_name',
      ])
      .orderBy(`ace.${orderBy}`, direction)
      .limit(limit)
      .offset(offset);

    for (const item of data) {
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

  async findOne(
    conditions: Record<string, any>,
  ): Promise<any | null> {
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
      .leftJoin(
        'approval as a',
        'ace.approval_id',
        'a.id',
      )
      .select([
        'ace.*',
        'omt.PMT_CODE as employee_pmt_code',
        'omt.PMT_NAME_T as employee_name_th',
        'omt.PMT_NAME_E as employee_name_en',
        'omt.PMT_POS_WK as employee_position',
        'omt.PMT_CUR_FAC as employee_faculty',
        'omt.PMT_EMAIL_ADDR as employee_email',
        'a.travel_type as approval_travel_type',
        'a.created_employee_code as requestor_code',
        'a.created_employee_name as requestor_name',
      ])
      .where(transformedConditions)
      .first();

    if (result) {
      const clothingAmounts = await this.knex('approval_clothing_expense')
        .select('clothing_amount')
        .where('approval_id', result.approval_id);
      
      const totalAmount = clothingAmounts.reduce((sum, record) => sum + (record.clothing_amount || 0), 0);
      result.approval_total_clothing_amount = totalAmount;
    }

    return result || null;
  }
}
