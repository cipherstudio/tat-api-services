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
       baseQuery = baseQuery.where(function() {
         this.where(function() {
           this.where('clothing_expense_cancellation_requests.selected_staff_ids', 'like', `[${currentEmployeeId}]`)
               .orWhere('clothing_expense_cancellation_requests.selected_staff_ids', 'like', `[${currentEmployeeId},%`)
               .orWhere('clothing_expense_cancellation_requests.selected_staff_ids', 'like', `%,${currentEmployeeId}]`)
               .orWhere('clothing_expense_cancellation_requests.selected_staff_ids', 'like', `%,${currentEmployeeId},%`);
         })
         .orWhere('clothing_expense_cancellation_requests.creator_code', currentEmployeeId.toString());
       });
     }
  
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
          'f.original_name as attachment_original_name',
          'f.file_name as attachment_file_path',
        ])
        .orderBy(`clothing_expense_cancellation_requests.${orderBy}`, direction)
        .limit(limit || 10)
        .offset(offset);

      // ดึงข้อมูล approval_clothing_expense แยกต่างหาก
      const dataWithClothingExpenses = await Promise.all(
        data.map(async (item) => {
          let clothingExpensesQuery = this.knex('approval_clothing_expense')
            .select([
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
              'destination_country'
            ])
            .where('approval_id', item.approval_id);

          // ถ้า isRelateToMe = false ให้ filter เฉพาะ staff ที่อยู่ใน selected_staff_ids
          if (conditions.isRelateToMe !== true && item.selected_staff_ids) {
            try {
              const selectedStaffIds = JSON.parse(item.selected_staff_ids);
              if (Array.isArray(selectedStaffIds) && selectedStaffIds.length > 0) {
                clothingExpensesQuery = clothingExpensesQuery.whereIn('employee_code', selectedStaffIds);
              }
            } catch (e) {
              console.log(e,'error');
              // ถ้า parse JSON ไม่ได้ ให้ดึงทั้งหมด
            }
          }

          const clothingExpenses = await clothingExpensesQuery;

          return {
            ...item,
            clothing_expenses: clothingExpenses
          };
        })
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

    return result || null;
  }
}
