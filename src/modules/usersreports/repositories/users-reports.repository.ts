import { Injectable } from '@nestjs/common';
import { UsersReports } from '../entities/users-reports.entity';
import { KnexBaseRepository } from '../../../common/repositories/knex-base.repository';
import { KnexService } from '../../../database/knex-service/knex.service';
import { toCamelCase, toSnakeCase } from '../../../common/utils/case-mapping';

@Injectable()
export class UsersReportsRepository extends KnexBaseRepository<UsersReports> {
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
        result.data.map(async (e) => await toCamelCase<UsersReports>(e)),
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
      const transformedItem = await toCamelCase(item);
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
    const { page, limit, orderBy, orderDir, ...conditions } = query;
    const dbConditions: Record<string, any> = {};
    
    if (conditions.startDate) {
      dbConditions.created_at = { $gte: conditions.startDate };
    }
    if (conditions.endDate) {
      dbConditions.created_at = { ...dbConditions.created_at, $lte: conditions.endDate };
    }
    if (conditions.userId) {
      dbConditions.user_id = conditions.userId;
    }

    return this.findWithPagination(
      page || 1,
      limit || 10,
      dbConditions,
      orderBy || 'created_at',
      orderDir || 'desc',
    );
  }

  // Custom method for expenditure reports
  async findExpenditureReports(query: any) {
    const { page, limit, orderBy, orderDir, ...conditions } = query;
    const dbConditions: Record<string, any> = {};
    
    if (conditions.startDate) {
      dbConditions.created_at = { $gte: conditions.startDate };
    }
    if (conditions.endDate) {
      dbConditions.created_at = { ...dbConditions.created_at, $lte: conditions.endDate };
    }
    if (conditions.userId) {
      dbConditions.user_id = conditions.userId;
    }
    if (conditions.budgetType) {
      dbConditions.travel_type = conditions.budgetType;
    }

    return this.findWithPagination(
      page || 1,
      limit || 10,
      dbConditions,
      orderBy || 'created_at',
      orderDir || 'desc',
    );
  }

  // Custom method for clothing reports
  async findClothingReports(query: any) {
    const { page, limit, orderBy, orderDir, ...conditions } = query;
    const dbConditions: Record<string, any> = {};
    
    if (conditions.startDate) {
      dbConditions.created_at = { $gte: conditions.startDate };
    }
    if (conditions.endDate) {
      dbConditions.created_at = { ...dbConditions.created_at, $lte: conditions.endDate };
    }
    if (conditions.userId) {
      dbConditions.user_id = conditions.userId;
    }
    if (conditions.clothingType) {
      dbConditions.travel_type = conditions.clothingType;
    }

    return this.findWithPagination(
      page || 1,
      limit || 10,
      dbConditions,
      orderBy || 'created_at',
      orderDir || 'desc',
    );
  }

  // Custom method for activity reports
  async findActivityReports(query: any) {
    const { page, limit, orderBy, orderDir, ...conditions } = query;
    const dbConditions: Record<string, any> = {};
    
    if (conditions.startDate) {
      dbConditions.created_at = { $gte: conditions.startDate };
    }
    if (conditions.endDate) {
      dbConditions.created_at = { ...dbConditions.created_at, $lte: conditions.endDate };
    }
    if (conditions.userId) {
      dbConditions.user_id = conditions.userId;
    }
    if (conditions.activityType) {
      dbConditions.travel_type = conditions.activityType;
    }

    return this.findWithPagination(
      page || 1,
      limit || 10,
      dbConditions,
      orderBy || 'created_at',
      orderDir || 'desc',
    );
  }
} 