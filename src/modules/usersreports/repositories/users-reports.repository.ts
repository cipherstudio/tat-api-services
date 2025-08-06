import { Injectable } from '@nestjs/common';
import { CommuteReports } from '../entities/commute-reports.entity';
import { ClothingReport } from '../entities/clothing-report.entity';
import { ActivityReport } from '../entities/activity-report.entity';
import { ExpenditureReport } from '../entities/expenditure-report.entity';
import { WorkReport } from '../entities/work-report.entity';
import { KnexBaseRepository } from '../../../common/repositories/knex-base.repository';
import { KnexService } from '../../../database/knex-service/knex.service';
import { toCamelCase, toSnakeCase } from '../../../common/utils/case-mapping';

@Injectable()
export class UsersReportsRepository extends KnexBaseRepository<CommuteReports> {
  constructor(knexService: KnexService) {
    super(knexService, 'approval');
  }

  async findWithPagination(
    page: number = 1,
    limit: number = 10,
    conditions: Record<string, any> = {},
    orderBy: string = 'id',
    direction: 'asc' | 'desc' = 'asc',
  ) {
    const snakeCaseConditions = await toSnakeCase(conditions);

    const result = await this.knexService.findWithPagination(
      this.tableName,
      page,
      limit,
      snakeCaseConditions,
      orderBy,
      direction,
    );
    const totalPages = Math.ceil(result.meta.total / limit);
    return {
      ...result,
      meta: {
        ...result.meta,
        totalPages,
        lastPage: totalPages,
      },
      data: await Promise.all(
        result.data.map(async (e) => await toCamelCase<CommuteReports>(e)),
      ),
    };
  }

  // Custom method for commute reports
  async findCommuteReports(queryParams: any) {
    // Extract pagination and sorting parameters
    const { page, limit, orderBy, orderDir, ...conditions } = queryParams;
    
    // Build query with join to approval_status_labels
    let dbQuery = this.knexService.knex('approval')
      .leftJoin('approval_status_labels', 'approval.approval_status_label_id', 'approval_status_labels.id')
      .select(
        'approval.*',
        'approval_status_labels.label as status_label',
        'approval_status_labels.status_code as status_code'
      );

    // Add LIKE conditions for incrementId and documentTitle
    if (conditions.incrementId) {
      dbQuery = dbQuery.where('approval.increment_id', 'like', `%${conditions.incrementId}%`);
    }

    if (conditions.documentTitle) {
      dbQuery = dbQuery.where('approval.document_title', 'like', `%${conditions.documentTitle}%`);
    }

    // Add date range conditions for approval date
    if (conditions.approvalDateStart && conditions.approvalDateEnd) {
      // Both dates provided - filter by date range
      dbQuery = dbQuery.whereBetween('approval.approval_date', [
        conditions.approvalDateStart,
        conditions.approvalDateEnd,
      ]);
    } else if (conditions.approvalDateStart) {
      // Only start date provided - filter from start date onwards
      dbQuery = dbQuery.where('approval.approval_date', '>=', conditions.approvalDateStart);
    } else if (conditions.approvalDateEnd) {
      // Only end date provided - filter up to end date
      dbQuery = dbQuery.where('approval.approval_date', '<=', conditions.approvalDateEnd);
    }

    // Add travel type filter if provided
    if (conditions.travelType) {
      dbQuery = dbQuery.where('approval.travel_type', conditions.travelType);
    }

    // Add approval status filter if provided
    if (conditions.approvalStatus) {
      dbQuery = dbQuery.where('approval_status_labels.status_code', conditions.approvalStatus);
    }

    // Add order by
    const orderByField = orderBy || 'approval.created_at';
    const orderDirection = orderDir || 'desc';
    dbQuery = dbQuery.orderBy(orderByField, orderDirection);

    // Get total count for pagination (without ORDER BY)
    const countQuery = this.knexService.knex('approval')
      .leftJoin('approval_status_labels', 'approval.approval_status_label_id', 'approval_status_labels.id');

    // Apply the same filters to count query
    if (conditions.incrementId) {
      countQuery.where('approval.increment_id', 'like', `%${conditions.incrementId}%`);
    }
    if (conditions.documentTitle) {
      countQuery.where('approval.document_title', 'like', `%${conditions.documentTitle}%`);
    }
    if (conditions.approvalDateStart && conditions.approvalDateEnd) {
      countQuery.whereBetween('approval.approval_date', [
        conditions.approvalDateStart,
        conditions.approvalDateEnd,
      ]);
    } else if (conditions.approvalDateStart) {
      countQuery.where('approval.approval_date', '>=', conditions.approvalDateStart);
    } else if (conditions.approvalDateEnd) {
      countQuery.where('approval.approval_date', '<=', conditions.approvalDateEnd);
    }
    if (conditions.travelType) {
      countQuery.where('approval.travel_type', conditions.travelType);
    }
    if (conditions.approvalStatus) {
      countQuery.where('approval_status_labels.status_code', conditions.approvalStatus);
    }

    const total = await countQuery.count('* as count').first();

    // Add pagination
    const pageNum = page || 1;
    const limitNum = limit || 10;
    const offset = (pageNum - 1) * limitNum;
    
    dbQuery = dbQuery.limit(limitNum).offset(offset);

    // Execute query
    const data = await dbQuery;

    // Get date ranges for all approvals
    const approvalIds = data.map(item => item.id);
    let dateRanges: any[] = [];
    
    if (approvalIds.length > 0) {
      const dateRangePromises = approvalIds.map(async (approvalId) => {
        const dateRangesForApproval = await this.knexService
          .knex('approval_date_ranges')
          .select('approval_id', 'start_date', 'end_date')
          .where('approval_id', approvalId)
          .orderBy('start_date', 'asc');
        return dateRangesForApproval;
      });

      dateRanges = await Promise.all(dateRangePromises);
    }

    // Create a map of date ranges by approval ID
    const dateRangeMap = new Map();
    dateRanges.forEach((dateRangeArray) => {
      if (dateRangeArray && dateRangeArray.length > 0) {
        const approvalId = dateRangeArray[0].approval_id;
        dateRangeMap.set(
          approvalId,
          dateRangeArray.map((range) => ({
            startDate: range.start_date,
            endDate: range.end_date,
          })),
        );
      }
    });

    // Calculate pagination metadata
    const totalCount = total ? parseInt(total.count as string) : 0;
    const totalPages = Math.ceil(totalCount / limitNum);

    // Transform data and add date ranges
    const transformedData = await Promise.all(data.map(async (item) => {
      const transformedItem = await toCamelCase<CommuteReports>(item);
      return {
        ...(transformedItem as any),
        approvalDateRanges: dateRangeMap.get(item.id) || [],
      };
    }));

    return {
      data: transformedData,
      meta: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages,
        lastPage: totalPages,
      },
    };
  }

  // Custom method for work reports
  async findWorkReports(query: any) {
    // Extract pagination and sorting parameters
    const { page, limit, orderBy, orderDir, ...conditions } = query;
    
    // Build query with join to report_approve_status
    let dbQuery = this.knexService.knex('report_approve')
      .leftJoin('report_approve_status', 'report_approve.status', 'report_approve_status.id')
      .select(
        'report_approve.id',
        'report_approve.document_number',
        'report_approve.title',
        'report_approve.creator_name',
        'report_approve.creator_code',
        'report_approve.approve_id',
        'report_approve.status',
        'report_approve.created_at',
        'report_approve.updated_at',
        'report_approve_status.status as status_name'
      );

    // Add LIKE conditions for document_number and title
    if (conditions.documentNumber) {
      dbQuery = dbQuery.where('report_approve.document_number', 'like', `%${conditions.documentNumber}%`);
    }

    if (conditions.title) {
      dbQuery = dbQuery.where('report_approve.title', 'like', `%${conditions.title}%`);
    }

    // Add order by
    const orderByField = orderBy || 'report_approve.created_at';
    const orderDirection = orderDir || 'desc';
    dbQuery = dbQuery.orderBy(orderByField, orderDirection);

    // Get total count for pagination (without ORDER BY)
    const countQuery = this.knexService.knex('report_approve')
      .leftJoin('report_approve_status', 'report_approve.status', 'report_approve_status.id');

    // Apply the same filters to count query
    if (conditions.documentNumber) {
      countQuery.where('report_approve.document_number', 'like', `%${conditions.documentNumber}%`);
    }
    if (conditions.title) {
      countQuery.where('report_approve.title', 'like', `%${conditions.title}%`);
    }

    const total = await countQuery.count('* as count').first();

    // Add pagination
    const pageNum = page || 1;
    const limitNum = limit || 10;
    const offset = (pageNum - 1) * limitNum;
    
    dbQuery = dbQuery.limit(limitNum).offset(offset);

    // Execute query
    const data = await dbQuery;

    // Calculate pagination metadata
    const totalCount = total ? parseInt(total.count as string) : 0;
    const totalPages = Math.ceil(totalCount / limitNum);

    // Transform data
    const transformedData = await Promise.all(data.map(async (item) => {
      const transformedItem = await toCamelCase<WorkReport>(item);
      return transformedItem;
    }));

    return {
      data: transformedData,
      meta: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages,
        lastPage: totalPages,
      },
    };
  }

  // Custom method for expenditure reports
  async findExpenditureReports(query: any) {
    // Extract pagination and sorting parameters
    const { page, limit, orderBy, orderDir, ...conditions } = query;
    
    // Build query with join to approval and OP_ORGANIZE_R
    let dbQuery = this.knexService.knex('approval_budgets')
      .leftJoin('approval', 'approval_budgets.approval_id', 'approval.id')
      .leftJoin('OP_ORGANIZE_R', 'approval_budgets.department', 'OP_ORGANIZE_R.POG_CODE')
      .whereNotNull('approval.approval_date')
      .select(
        'approval_budgets.id',
        'approval_budgets.budget_type',
        'approval_budgets.item_type',
        'approval_budgets.department',
        'approval_budgets.approval_id',
        'approval_budgets.created_at',
        'approval_budgets.updated_at',
        'approval.document_title',
        'approval.name',
        'approval.approval_date',
        'OP_ORGANIZE_R.POG_DESC'
      );

    // Add date range conditions for approval date
    if (conditions.startDate && conditions.endDate) {
      // Both dates provided - filter by date range
      dbQuery = dbQuery.whereBetween('approval.approval_date', [
        conditions.startDate,
        conditions.endDate,
      ]);
    } else if (conditions.startDate) {
      // Only start date provided - filter from start date onwards
      dbQuery = dbQuery.where('approval.approval_date', '>=', conditions.startDate);
    } else if (conditions.endDate) {
      // Only end date provided - filter up to end date
      dbQuery = dbQuery.where('approval.approval_date', '<=', conditions.endDate);
    }

    // Add budget type filter if provided
    if (conditions.budgetType) {
      dbQuery = dbQuery.where('approval_budgets.budget_type', conditions.budgetType);
    }

    // Add travel type filter if provided
    if (conditions.travelType) {
      dbQuery = dbQuery.where('approval_budgets.item_type', conditions.travelType);
    }

    // Add min amount filter if provided
    if (conditions.minAmount) {
      dbQuery = dbQuery.where('approval_budgets.amount', '>=', conditions.minAmount);
    }

    // Add max amount filter if provided
    if (conditions.maxAmount) {
      dbQuery = dbQuery.where('approval_budgets.amount', '<=', conditions.maxAmount);
    }

    // Add user ID filter if provided
    if (conditions.userId) {
      dbQuery = dbQuery.where('approval.created_employee_code', conditions.userId);
    }

    // Add order by
    const orderByField = orderBy || 'approval_budgets.created_at';
    const orderDirection = orderDir || 'desc';
    dbQuery = dbQuery.orderBy(orderByField, orderDirection);

    // Get total count for pagination (without ORDER BY)
    const countQuery = this.knexService.knex('approval_budgets')
      .leftJoin('approval', 'approval_budgets.approval_id', 'approval.id')
      .leftJoin('OP_ORGANIZE_R', 'approval_budgets.department', 'OP_ORGANIZE_R.POG_CODE')
      .whereNotNull('approval.approval_date');

    // Apply the same filters to count query
    if (conditions.startDate && conditions.endDate) {
      countQuery.whereBetween('approval.approval_date', [
        conditions.startDate,
        conditions.endDate,
      ]);
    } else if (conditions.startDate) {
      countQuery.where('approval.approval_date', '>=', conditions.startDate);
    } else if (conditions.endDate) {
      countQuery.where('approval.approval_date', '<=', conditions.endDate);
    }
    if (conditions.budgetType) {
      countQuery.where('approval_budgets.budget_type', conditions.budgetType);
    }
    if (conditions.travelType) {
      countQuery.where('approval_budgets.item_type', conditions.travelType);
    }
    if (conditions.minAmount) {
      countQuery.where('approval_budgets.amount', '>=', conditions.minAmount);
    }
    if (conditions.maxAmount) {
      countQuery.where('approval_budgets.amount', '<=', conditions.maxAmount);
    }
    if (conditions.userId) {
      countQuery.where('approval.created_employee_code', conditions.userId);
    }

    const total = await countQuery.count('* as count').first();

    // Add pagination
    const pageNum = page || 1;
    const limitNum = limit || 10;
    const offset = (pageNum - 1) * limitNum;
    
    dbQuery = dbQuery.limit(limitNum).offset(offset);

    // Execute query
    const data = await dbQuery;

    // Calculate pagination metadata
    const totalCount = total ? parseInt(total.count as string) : 0;
    const totalPages = Math.ceil(totalCount / limitNum);

    // Transform data
    const transformedData = await Promise.all(data.map(async (item) => {
      const transformedItem = await toCamelCase<ExpenditureReport>(item);
      return transformedItem;
    }));

    return {
      data: transformedData,
      meta: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages,
        lastPage: totalPages,
      },
    };
  }

  // Custom method for clothing reports
  async findClothingReports(query: any) {
    // Extract pagination and sorting parameters
    const { page, limit, orderBy, orderDir, ...conditions } = query;
    
    // Build query with join to approval, approval_date_ranges, and EMPLOYEE
    let dbQuery = this.knexService.knex('approval_clothing_expense')
      .leftJoin('approval', 'approval_clothing_expense.approval_id', 'approval.id')
      .leftJoin('EMPLOYEE', 'approval_clothing_expense.employee_code', 'EMPLOYEE.CODE')
      .select(
        'approval_clothing_expense.id',
        'approval_clothing_expense.clothing_file_checked',
        'approval_clothing_expense.clothing_amount',
        'approval_clothing_expense.clothing_reason',
        'approval_clothing_expense.reporting_date',
        'approval_clothing_expense.next_claim_date',
        'approval_clothing_expense.work_end_date',
        'approval_clothing_expense.created_at',
        'approval_clothing_expense.updated_at',
        'approval_clothing_expense.staff_member_id',
        'approval_clothing_expense.approval_id',
        'approval_clothing_expense.employee_code',
        'approval_clothing_expense.increment_id',
        'approval_clothing_expense.destination_country',
        'approval.increment_id as approval_increment_id',
        'approval.document_title',
        'approval.approval_date',
        'approval.created_employee_code',
        'approval.created_employee_name',
        'EMPLOYEE.NAME as employee_name'
      );

    // Add date range conditions for approval date
    if (conditions.startDate && conditions.endDate) {
      // Both dates provided - filter by date range
      dbQuery = dbQuery.whereBetween('approval.approval_date', [
        conditions.startDate,
        conditions.endDate,
      ]);
    } else if (conditions.startDate) {
      // Only start date provided - filter from start date onwards
      dbQuery = dbQuery.where('approval.approval_date', '>=', conditions.startDate);
    } else if (conditions.endDate) {
      // Only end date provided - filter up to end date
      dbQuery = dbQuery.where('approval.approval_date', '<=', conditions.endDate);
    }

    // Add employee name filter if provided
    if (conditions.employeeName) {
      dbQuery = dbQuery.where('EMPLOYEE.NAME', 'like', `%${conditions.employeeName}%`);
    }

    // Add order by
    const orderByField = orderBy || 'approval_clothing_expense.created_at';
    const orderDirection = orderDir || 'desc';
    dbQuery = dbQuery.orderBy(orderByField, orderDirection);

    // Get total count for pagination (without ORDER BY)
    const countQuery = this.knexService.knex('approval_clothing_expense')
      .leftJoin('approval', 'approval_clothing_expense.approval_id', 'approval.id')
      .leftJoin('EMPLOYEE', 'approval_clothing_expense.employee_code', 'EMPLOYEE.CODE');

    // Apply the same filters to count query
    if (conditions.startDate && conditions.endDate) {
      countQuery.whereBetween('approval.approval_date', [
        conditions.startDate,
        conditions.endDate,
      ]);
    } else if (conditions.startDate) {
      countQuery.where('approval.approval_date', '>=', conditions.startDate);
    } else if (conditions.endDate) {
      countQuery.where('approval.approval_date', '<=', conditions.endDate);
    }
    if (conditions.employeeName) {
      countQuery.where('EMPLOYEE.NAME', 'like', `%${conditions.employeeName}%`);
    }

    const total = await countQuery.count('* as count').first();

    // Add pagination
    const pageNum = page || 1;
    const limitNum = limit || 10;
    const offset = (pageNum - 1) * limitNum;
    
    dbQuery = dbQuery.limit(limitNum).offset(offset);

    // Execute query
    const data = await dbQuery;

    // Get date ranges for all approvals
    const approvalIds = data.map(item => item.approval_id).filter(id => id);
    let dateRanges: any[] = [];
    
    if (approvalIds.length > 0) {
      const dateRangePromises = approvalIds.map(async (approvalId) => {
        const dateRangesForApproval = await this.knexService
          .knex('approval_date_ranges')
          .select('approval_id', 'start_date', 'end_date')
          .where('approval_id', approvalId)
          .orderBy('start_date', 'asc');
        return dateRangesForApproval;
      });

      dateRanges = await Promise.all(dateRangePromises);
    }

    // Create a map of date ranges by approval ID
    const dateRangeMap = new Map();
    dateRanges.forEach((dateRangeArray) => {
      if (dateRangeArray && dateRangeArray.length > 0) {
        const approvalId = dateRangeArray[0].approval_id;
        dateRangeMap.set(
          approvalId,
          dateRangeArray.map((range) => ({
            startDate: range.start_date,
            endDate: range.end_date,
          })),
        );
      }
    });

    // Calculate pagination metadata
    const totalCount = total ? parseInt(total.count as string) : 0;
    const totalPages = Math.ceil(totalCount / limitNum);

    // Transform data and add date ranges
    const transformedData = await Promise.all(data.map(async (item) => {
      const transformedItem = await toCamelCase<ClothingReport>(item);
      return {
        ...(transformedItem as any),
        approvalDateRanges: dateRangeMap.get(item.approval_id) || [],
      };
    }));

    return {
      data: transformedData,
      meta: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages,
        lastPage: totalPages,
      },
    };
  }

  // Custom method for activity reports
  async findActivityReports(queryParams: any) {
    const { page, limit, orderBy, orderDir, ...conditions } = queryParams;
    
    // Build query from audit_logs table
    let dbQuery = this.knexService.knex('audit_logs')
      .where('audit_logs.action', 'LOGIN')
      .where('audit_logs.category', 'auth')
      .where('audit_logs.status', 'success')
      .select(
        'audit_logs.id',
        'audit_logs.employee_code',
        'audit_logs.created_at',
        'audit_logs.employee_name'
      );

    // Apply filters
    if (conditions.startDate && conditions.endDate) {
      dbQuery = dbQuery.whereBetween('audit_logs.created_at', [
        this.knexService.knex.raw('TO_DATE(?, \'YYYY-MM-DD\')', [conditions.startDate]),
        this.knexService.knex.raw('TO_DATE(?, \'YYYY-MM-DD HH24:MI:SS\')', [conditions.endDate + ' 23:59:59']),
      ]);
    } else if (conditions.startDate) {
      dbQuery = dbQuery.where('audit_logs.created_at', '>=', this.knexService.knex.raw('TO_DATE(?, \'YYYY-MM-DD\')', [conditions.startDate]));
    } else if (conditions.endDate) {
      dbQuery = dbQuery.where('audit_logs.created_at', '<=', this.knexService.knex.raw('TO_DATE(?, \'YYYY-MM-DD HH24:MI:SS\')', [conditions.endDate + ' 23:59:59']));
    }
    if (conditions.employeeName) {
      dbQuery = dbQuery.where('audit_logs.employee_name', 'like', `%${conditions.employeeName}%`);
    }

    const orderByField = orderBy || 'audit_logs.created_at';
    const orderDirection = orderDir || 'desc';
    dbQuery = dbQuery.orderBy(orderByField, orderDirection);

    // Get total count for pagination (separated query)
    const countQuery = this.knexService.knex('audit_logs')
      .where('audit_logs.action', 'LOGIN')
      .where('audit_logs.category', 'auth')
      .where('audit_logs.status', 'success');

    // Apply the same filters to count query
    if (conditions.startDate && conditions.endDate) {
      countQuery.whereBetween('audit_logs.created_at', [
        this.knexService.knex.raw('TO_DATE(?, \'YYYY-MM-DD\')', [conditions.startDate]),
        this.knexService.knex.raw('TO_DATE(?, \'YYYY-MM-DD HH24:MI:SS\')', [conditions.endDate + ' 23:59:59']),
      ]);
    } else if (conditions.startDate) {
      countQuery.where('audit_logs.created_at', '>=', this.knexService.knex.raw('TO_DATE(?, \'YYYY-MM-DD\')', [conditions.startDate]));
    } else if (conditions.endDate) {
      countQuery.where('audit_logs.created_at', '<=', this.knexService.knex.raw('TO_DATE(?, \'YYYY-MM-DD HH24:MI:SS\')', [conditions.endDate + ' 23:59:59']));
    }
    if (conditions.employeeName) {
      countQuery.where('audit_logs.employee_name', 'like', `%${conditions.employeeName}%`);
    }

    // Count total audit logs
    const total = await countQuery.count('* as count').first();

    // Add pagination
    const pageNum = page || 1;
    const limitNum = limit || 10;
    const offset = (pageNum - 1) * limitNum;
    
    dbQuery = dbQuery.limit(limitNum).offset(offset);

    // Execute query
    const data = await dbQuery;

    // Calculate pagination metadata
    const totalCount = total ? parseInt(total.count as string) : 0;
    const totalPages = Math.ceil(totalCount / limitNum);

    // Transform data
    const transformedData = await Promise.all(data.map(async (item) => {
      const transformedItem = await toCamelCase<ActivityReport>(item);
      return transformedItem;
    }));

    return {
      data: transformedData,
      meta: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages,
        lastPage: totalPages,
      },
    };
  }
} 