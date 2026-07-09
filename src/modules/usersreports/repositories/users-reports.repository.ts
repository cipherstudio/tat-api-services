import { Injectable } from '@nestjs/common';
import { CommuteReports } from '../entities/commute-reports.entity';
import { ClothingReport } from '../entities/clothing-report.entity';
import { ActivityReport } from '../entities/activity-report.entity';
import { ExpenditureReport } from '../entities/expenditure-report.entity';
import { WorkReport } from '../entities/work-report.entity';
import { KnexBaseRepository } from '../../../common/repositories/knex-base.repository';
import { KnexService } from '../../../database/knex-service/knex.service';
import { toCamelCase, toSnakeCase } from '../../../common/utils/case-mapping';
import { ApprovalAttachmentService } from '../../approval/services/approval-attachment.service';

@Injectable()
export class UsersReportsRepository extends KnexBaseRepository<CommuteReports> {
  constructor(
    knexService: KnexService,
    private readonly attachmentService: ApprovalAttachmentService,
  ) {
    super(knexService, 'approval');
  }

  // Matches a "ตั้งแต่วันที่/ถึงวันที่" travel-date filter against the
  // actual travel period in approval_date_ranges (an approval can have
  // several date ranges for multi-leg trips), rather than approval.approval_date
  // (the approval decision date - a different concept entirely).
  // - Only one side given: exact match on that single day (a date range
  //   starting, or ending, exactly on that day) - not an open-ended range.
  // - Both sides given: a real range search (overlap with [start, end]).
  private applyTravelDateFilter(
    query: any,
    approvalIdColumn: string,
    startDate?: string,
    endDate?: string,
  ): any {
    if (startDate && endDate) {
      return query.whereRaw(
        `EXISTS (SELECT 1 FROM "approval_date_ranges" "adr" WHERE "adr"."approval_id" = ${approvalIdColumn} AND "adr"."end_date" >= ? AND "adr"."start_date" <= ?)`,
        [startDate, endDate],
      );
    }
    // Only one side given: exact match on start_date (the same column shown
    // as "วันที่เดินทาง" in the table) regardless of which input box - ตั้งแต่/ถึง
    // both just mean "this single day", same as the work/activity pages.
    if (startDate) {
      return query.whereRaw(
        `EXISTS (SELECT 1 FROM "approval_date_ranges" "adr" WHERE "adr"."approval_id" = ${approvalIdColumn} AND "adr"."start_date" = ?)`,
        [startDate],
      );
    }
    if (endDate) {
      return query.whereRaw(
        `EXISTS (SELECT 1 FROM "approval_date_ranges" "adr" WHERE "adr"."approval_id" = ${approvalIdColumn} AND "adr"."start_date" = ?)`,
        [endDate],
      );
    }
    return query;
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
      .whereNull('approval.deleted_at') // Exclude soft deleted records
      .select(
        'approval.*',
        'approval_status_labels.label as status_label',
        'approval_status_labels.status_code as status_code',
        this.knexService.knex.raw(
          `COALESCE(
            (SELECT "awl"."destination" FROM "approval_work_locations" "awl" WHERE "awl"."approval_id" = "approval"."id" AND "awl"."destination" IS NOT NULL AND ROWNUM = 1),
            (SELECT "ate"."destination" FROM "approval_trip_entries" "ate" WHERE "ate"."approval_id" = "approval"."id" AND "ate"."destination" IS NOT NULL AND ROWNUM = 1)
          ) as work_destination`
        ),
        this.knexService.knex.raw(
          `(COALESCE("approval"."form3_total_amount", 0) + COALESCE("approval"."form4_total_amount", 0) + COALESCE("approval"."form5_total_amount", 0)) as requested_amount`
        ),
        this.knexService.knex.raw(
          `(SELECT COUNT(*) FROM "approval_staff_members" "asm" WHERE "asm"."approval_id" = "approval"."id") as traveler_count`
        ),
        this.knexService.knex.raw(
          `(SELECT MIN("adr"."start_date") FROM "approval_date_ranges" "adr" WHERE "adr"."approval_id" = "approval"."id") as range_start_date`
        ),
        this.knexService.knex.raw(
          `(SELECT MAX("adr"."end_date") FROM "approval_date_ranges" "adr" WHERE "adr"."approval_id" = "approval"."id") as range_end_date`
        )
      );

    // Add LIKE conditions for incrementId and documentTitle
    if (conditions.incrementId) {
      dbQuery = dbQuery.where('approval.increment_id', 'like', `%${conditions.incrementId}%`);
    }

    if (conditions.documentTitle) {
      dbQuery = dbQuery.where('approval.document_title', 'like', `%${conditions.documentTitle}%`);
    }

    // Add requester name filter
    if (conditions.requesterName) {
      dbQuery = dbQuery.where('approval.name', 'like', `%${conditions.requesterName}%`);
    }

    // Add date range conditions - matches against the actual travel dates
    // (approval_date_ranges), not approval.approval_date (approval date).
    dbQuery = this.applyTravelDateFilter(
      dbQuery,
      '"approval"."id"',
      conditions.approvalDateStart,
      conditions.approvalDateEnd,
    );

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
      .leftJoin('approval_status_labels', 'approval.approval_status_label_id', 'approval_status_labels.id')
      .whereNull('approval.deleted_at'); // Exclude soft deleted records

    // Apply the same filters to count query
    if (conditions.incrementId) {
      countQuery.where('approval.increment_id', 'like', `%${conditions.incrementId}%`);
    }
    if (conditions.documentTitle) {
      countQuery.where('approval.document_title', 'like', `%${conditions.documentTitle}%`);
    }
    if (conditions.requesterName) {
      countQuery.where('approval.name', 'like', `%${conditions.requesterName}%`);
    }
    this.applyTravelDateFilter(
      countQuery,
      '"approval"."id"',
      conditions.approvalDateStart,
      conditions.approvalDateEnd,
    );
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
    let allAttachments: any[] = [];
    
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

      // Get all attachments for each approval
      const allAttachmentPromises = approvalIds.map(async (approvalId) => {
        const documentAtts = await this.attachmentService.getAttachments(
          'approval_document',
          approvalId,
        );
        const signatureAtts = await this.attachmentService.getAttachments(
          'approval_signature',
          approvalId,
        );
        const budgetAtts = await this.attachmentService.getAttachments(
          'approval_budgets',
          approvalId,
        );
        const clothingAtts = await this.attachmentService.getAttachments(
          'approval_clothing_expense',
          approvalId,
        );
        const continuousAtts = await this.attachmentService.getAttachments(
          'approval_continuous_signature',
          approvalId,
        );
        const accommodationTransportAtts = await this.attachmentService.getAttachments(
          'approval_accommodation_transport_expense',
          approvalId,
        );
        return [
          ...documentAtts,
          ...signatureAtts,
          ...budgetAtts,
          ...clothingAtts,
          ...continuousAtts,
          ...accommodationTransportAtts,
        ];
      });
      allAttachments = await Promise.all(allAttachmentPromises);
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

    // Transform data and add date ranges and attachments
    const transformedData = await Promise.all(data.map(async (item, index) => {
      const transformedItem = await toCamelCase<CommuteReports>(item);
      // รวมไฟล์แนบ approval_attachments ทุกประเภท
      const allAtts =
        allAttachments[index] && allAttachments[index].length > 0
          ? allAttachments[index]
          : [];
      return {
        ...(transformedItem as any),
        approvalDateRanges: dateRangeMap.get(item.id) || [],
        attachments: allAtts,
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

    // Add creator name filter
    if (conditions.creatorName) {
      dbQuery = dbQuery.where('report_approve.creator_name', 'like', `%${conditions.creatorName}%`);
    }

    // Add date range conditions for created_at
    if (conditions.startDate && conditions.endDate) {
      // Both dates provided - filter by date range
      dbQuery = dbQuery.whereBetween('report_approve.created_at', [
        this.knexService.knex.raw('TO_DATE(?, \'YYYY-MM-DD\')', [conditions.startDate]),
        this.knexService.knex.raw('TO_DATE(?, \'YYYY-MM-DD HH24:MI:SS\')', [conditions.endDate + ' 23:59:59']),
      ]);
    } else if (conditions.startDate) {
      // Only start date provided - match that single day only
      dbQuery = dbQuery.whereBetween('report_approve.created_at', [
        this.knexService.knex.raw('TO_DATE(?, \'YYYY-MM-DD\')', [conditions.startDate]),
        this.knexService.knex.raw('TO_DATE(?, \'YYYY-MM-DD HH24:MI:SS\')', [conditions.startDate + ' 23:59:59']),
      ]);
    } else if (conditions.endDate) {
      // Only end date provided - match that single day only (ถึงวันที่ alone
      // still means "this one day", not "everything up to here")
      dbQuery = dbQuery.whereBetween('report_approve.created_at', [
        this.knexService.knex.raw('TO_DATE(?, \'YYYY-MM-DD\')', [conditions.endDate]),
        this.knexService.knex.raw('TO_DATE(?, \'YYYY-MM-DD HH24:MI:SS\')', [conditions.endDate + ' 23:59:59']),
      ]);
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
    if (conditions.creatorName) {
      countQuery.where('report_approve.creator_name', 'like', `%${conditions.creatorName}%`);
    }
    if (conditions.startDate && conditions.endDate) {
      countQuery.whereBetween('report_approve.created_at', [
        this.knexService.knex.raw('TO_DATE(?, \'YYYY-MM-DD\')', [conditions.startDate]),
        this.knexService.knex.raw('TO_DATE(?, \'YYYY-MM-DD HH24:MI:SS\')', [conditions.endDate + ' 23:59:59']),
      ]);
    } else if (conditions.startDate) {
      countQuery.whereBetween('report_approve.created_at', [
        this.knexService.knex.raw('TO_DATE(?, \'YYYY-MM-DD\')', [conditions.startDate]),
        this.knexService.knex.raw('TO_DATE(?, \'YYYY-MM-DD HH24:MI:SS\')', [conditions.startDate + ' 23:59:59']),
      ]);
    } else if (conditions.endDate) {
      countQuery.whereBetween('report_approve.created_at', [
        this.knexService.knex.raw('TO_DATE(?, \'YYYY-MM-DD\')', [conditions.endDate]),
        this.knexService.knex.raw('TO_DATE(?, \'YYYY-MM-DD HH24:MI:SS\')', [conditions.endDate + ' 23:59:59']),
      ]);
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
      .leftJoin('approval_status_labels', 'approval.approval_status_label_id', 'approval_status_labels.id')
      .whereNotNull('approval.approval_date')
      .whereNull('approval.deleted_at') // Exclude soft deleted records
      .select(
        'approval_budgets.id',
        'approval_budgets.budget_type',
        'approval_budgets.item_type',
        'approval_budgets.department',
        'approval_budgets.reservation_code',
        'approval_budgets.approval_id',
        'approval_budgets.created_at',
        'approval_budgets.updated_at',
        'approval.increment_id',
        'approval.travel_type',
        'approval.document_title',
        'approval.name',
        'approval.work_start_date',
        'approval.work_end_date',
        'approval.approval_date',
        'approval.created_at as approval_created_at',
        'approval.start_country',
        'approval.end_country',
        'approval_status_labels.label as status_label',
        'approval_status_labels.status_code as status_code',
        'OP_ORGANIZE_R.POG_DESC',
        this.knexService.knex.raw(
          `COALESCE(
            (SELECT "awl"."destination" FROM "approval_work_locations" "awl" WHERE "awl"."approval_id" = "approval"."id" AND "awl"."destination" IS NOT NULL AND ROWNUM = 1),
            (SELECT "ate"."destination" FROM "approval_trip_entries" "ate" WHERE "ate"."approval_id" = "approval"."id" AND "ate"."destination" IS NOT NULL AND ROWNUM = 1)
          ) as work_destination`
        ),
        this.knexService.knex.raw(
          `(COALESCE("approval"."form3_total_amount", 0) + COALESCE("approval"."form4_total_amount", 0) + COALESCE("approval"."form5_total_amount", 0)) as requested_amount`
        ),
        this.knexService.knex.raw(
          `(SELECT MIN("adr"."start_date") FROM "approval_date_ranges" "adr" WHERE "adr"."approval_id" = "approval"."id") as range_start_date`
        ),
        this.knexService.knex.raw(
          `(SELECT MAX("adr"."end_date") FROM "approval_date_ranges" "adr" WHERE "adr"."approval_id" = "approval"."id") as range_end_date`
        ),
        'approval.attachment_id',
        'approval.signature_attachment_id',
        'approval.form3_total_amount',
        'approval.form4_total_amount',
        'approval.form5_total_amount'
      );

    // Add LIKE condition for document number
    if (conditions.incrementId) {
      dbQuery = dbQuery.where('approval.increment_id', 'like', `%${conditions.incrementId}%`);
    }

    // Add travel type filter if provided
    if (conditions.travelType) {
      dbQuery = dbQuery.where('approval.travel_type', conditions.travelType);
    }

    // Add approval status filter if provided
    if (conditions.approvalStatus) {
      dbQuery = dbQuery.where('approval_status_labels.status_code', conditions.approvalStatus);
    }

    // Add date range conditions - matches against the actual travel dates
    // (approval_date_ranges), not approval.approval_date (approval date).
    dbQuery = this.applyTravelDateFilter(
      dbQuery,
      '"approval"."id"',
      conditions.startDate,
      conditions.endDate,
    );

    // Add budget type filter if provided
    if (conditions.budgetType) {
      dbQuery = dbQuery.where('approval_budgets.budget_type', conditions.budgetType);
    }

    // Add item type filter if provided
    if (conditions.itemType) {
      dbQuery = dbQuery.where('approval_budgets.item_type', conditions.itemType);
    }

    // Add department / reservation owner filter if provided
    if (conditions.department) {
      const ownerSearch = `%${conditions.department}%`;
      dbQuery = dbQuery.where(function () {
        this.where('OP_ORGANIZE_R.POG_DESC', 'like', ownerSearch).orWhere(
          'approval_budgets.reservation_code',
          'like',
          ownerSearch,
        );
      });
    }

    // Add document title filter if provided
    if (conditions.documentTitle) {
      dbQuery = dbQuery.where('approval.document_title', 'like', `%${conditions.documentTitle}%`);
    }

    // Add requester name filter if provided
    if (conditions.requesterName) {
      dbQuery = dbQuery.where('approval.name', 'like', `%${conditions.requesterName}%`);
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
      .leftJoin('approval_status_labels', 'approval.approval_status_label_id', 'approval_status_labels.id')
      .whereNotNull('approval.approval_date')
      .whereNull('approval.deleted_at'); // Exclude soft deleted records

    // Apply the same filters to count query
    this.applyTravelDateFilter(
      countQuery,
      '"approval"."id"',
      conditions.startDate,
      conditions.endDate,
    );
    if (conditions.incrementId) {
      countQuery.where('approval.increment_id', 'like', `%${conditions.incrementId}%`);
    }
    if (conditions.travelType) {
      countQuery.where('approval.travel_type', conditions.travelType);
    }
    if (conditions.approvalStatus) {
      countQuery.where('approval_status_labels.status_code', conditions.approvalStatus);
    }
    if (conditions.budgetType) {
      countQuery.where('approval_budgets.budget_type', conditions.budgetType);
    }
    if (conditions.itemType) {
      countQuery.where('approval_budgets.item_type', conditions.itemType);
    }
    if (conditions.department) {
      const ownerSearch = `%${conditions.department}%`;
      countQuery.where(function () {
        this.where('OP_ORGANIZE_R.POG_DESC', 'like', ownerSearch).orWhere(
          'approval_budgets.reservation_code',
          'like',
          ownerSearch,
        );
      });
    }
    if (conditions.documentTitle) {
      countQuery.where('approval.document_title', 'like', `%${conditions.documentTitle}%`);
    }
    if (conditions.requesterName) {
      countQuery.where('approval.name', 'like', `%${conditions.requesterName}%`);
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

    const approvalIds = [...new Set(data.map((item) => item.approval_id))];
    const dateRangeMap = new Map<number, Array<{ startDate: string; endDate: string }>>();
    const attachmentMap = new Map<number, any[]>();

    if (approvalIds.length > 0) {
      const dateRanges = await this.knexService
        .knex('approval_date_ranges')
        .select('approval_id', 'start_date', 'end_date')
        .whereIn('approval_id', approvalIds)
        .orderBy('start_date', 'asc');

      dateRanges.forEach((range) => {
        const approvalId = range.approval_id as number;
        const existing = dateRangeMap.get(approvalId) || [];
        existing.push({
          startDate: range.start_date,
          endDate: range.end_date,
        });
        dateRangeMap.set(approvalId, existing);
      });

      const attachmentResults = await Promise.all(
        approvalIds.map(async (approvalId) => {
          const documentAtts = await this.attachmentService.getAttachments(
            'approval_document',
            approvalId,
          );
          const signatureAtts = await this.attachmentService.getAttachments(
            'approval_signature',
            approvalId,
          );
          const budgetAtts = await this.attachmentService.getAttachments(
            'approval_budgets',
            approvalId,
          );
          const clothingAtts = await this.attachmentService.getAttachments(
            'approval_clothing_expense',
            approvalId,
          );
          const continuousAtts = await this.attachmentService.getAttachments(
            'approval_continuous_signature',
            approvalId,
          );
          const accommodationTransportAtts =
            await this.attachmentService.getAttachments(
              'approval_accommodation_transport_expense',
              approvalId,
            );
          return {
            approvalId,
            attachments: [
              ...documentAtts,
              ...signatureAtts,
              ...budgetAtts,
              ...clothingAtts,
              ...continuousAtts,
              ...accommodationTransportAtts,
            ],
          };
        }),
      );

      attachmentResults.forEach(({ approvalId, attachments }) => {
        attachmentMap.set(approvalId, attachments);
      });
    }

    // Calculate pagination metadata
    const totalCount = total ? parseInt(total.count as string) : 0;
    const totalPages = Math.ceil(totalCount / limitNum);

    // Transform data
    const transformedData = await Promise.all(data.map(async (item) => {
      const transformedItem = await toCamelCase<ExpenditureReport>(item);
      const approvalId = item.approval_id as number;
      return {
        ...(transformedItem as any),
        approvalDateRanges: dateRangeMap.get(approvalId) || [],
        attachments: attachmentMap.get(approvalId) || [],
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

  // Custom method for clothing reports
  private applyClothingCancellationStatusFilter(
    query: any,
    cancellationStatus?: string,
  ) {
    if (!cancellationStatus || cancellationStatus === 'all') {
      return;
    }

    const knex = this.knexService.knex;
    const pendingMatchSubquery = function (this: any) {
      this.select(knex.raw('1'))
        .from('clothing_expense_cancellation_requests as cecr')
        .whereRaw('"cecr"."approval_id" = "approval_clothing_expense"."approval_id"')
        .where('cecr.status', 'pending')
        .where(function () {
          this.whereRaw(
            '"cecr"."selected_staff_ids" LIKE \'%\' || CAST("approval_clothing_expense"."staff_member_id" AS VARCHAR2(20)) || \'%\'',
          ).orWhereRaw(
            '"cecr"."selected_staff_ids" LIKE \'%\' || RTRIM(CAST("approval_clothing_expense"."employee_code" AS VARCHAR2(255))) || \'%\'',
          );
        });
    };

    if (cancellationStatus === 'cancelled') {
      query.where('approval_clothing_expense.is_cancelled', true);
    } else if (cancellationStatus === 'pending_cancel') {
      query
        .where('approval_clothing_expense.is_cancelled', false)
        .whereExists(pendingMatchSubquery);
    } else if (cancellationStatus === 'claimed') {
      query
        .where('approval_clothing_expense.is_cancelled', false)
        .whereNotExists(pendingMatchSubquery);
    }
  }

  private matchesCancellationToClothingRow(
    row: {
      approval_id: number;
      id: number;
      staff_member_id: number;
      employee_code: string;
    },
    cancellation: {
      approval_id: number;
      selected_staff_ids?: string | null;
      clothing_expense_id?: number | null;
      clothing_employee_code?: string | null;
    },
  ): boolean {
    if (cancellation.approval_id !== row.approval_id) {
      return false;
    }

    if (cancellation.selected_staff_ids) {
      try {
        const parsed = JSON.parse(cancellation.selected_staff_ids);
        if (Array.isArray(parsed)) {
          const ids = parsed
            .filter(
              (v) =>
                v != null && String(v).trim() !== '' && String(v) !== 'null',
            )
            .map((v) => String(v));
          if (ids.length > 0) {
            return (
              ids.includes(String(row.staff_member_id)) ||
              ids.includes(String(row.employee_code))
            );
          }
        }
      } catch {
        // ignore invalid JSON
      }
    }

    if (
      cancellation.clothing_expense_id &&
      row.id === cancellation.clothing_expense_id
    ) {
      return true;
    }

    if (
      cancellation.clothing_employee_code &&
      String(row.employee_code) === String(cancellation.clothing_employee_code)
    ) {
      return true;
    }

    return false;
  }

  private resolveClothingReportCancellation(
    row: {
      approval_id: number;
      id: number;
      staff_member_id: number;
      employee_code: string;
      is_cancelled?: boolean | number;
      cancelled_at?: string | Date | null;
      cancellation_request_id?: number | null;
    },
    cancellations: Array<{
      id: number;
      approval_id: number;
      status: string;
      creator_name?: string;
      approved_by_name?: string | null;
      approved_at?: string | Date | null;
      created_at?: string | Date;
      updated_at?: string | Date;
      selected_staff_ids?: string | null;
      clothing_expense_id?: number | null;
      clothing_employee_code?: string | null;
    }>,
  ) {
    const isCancelled =
      row.is_cancelled === true ||
      row.is_cancelled === 1 ||
      String(row.is_cancelled) === '1';

    if (isCancelled) {
      // #259.2 — แสดงชื่อแอดมินผู้กดอนุมัติยกเลิก (approved_by_name) ไม่ใช่ผู้ขอ (creator_name)
      const approvedMatch = cancellations.find(
        (c) => c.id === row.cancellation_request_id,
      );
      return {
        cancellationStatus: 'cancelled' as const,
        cancellationId: row.cancellation_request_id ?? null,
        cancellationBy: approvedMatch?.approved_by_name ?? null,
        cancellationAt: row.cancelled_at ?? null,
      };
    }

    const pendingMatch = cancellations.find(
      (c) =>
        c.status === 'pending' &&
        this.matchesCancellationToClothingRow(row, c),
    );

    if (pendingMatch) {
      return {
        cancellationStatus: 'pending_cancel' as const,
        cancellationId: pendingMatch.id,
        cancellationBy: pendingMatch.creator_name ?? null,
        cancellationAt: pendingMatch.created_at ?? null,
      };
    }

    return {
      cancellationStatus: 'claimed' as const,
      cancellationId: null,
      cancellationBy: null,
      cancellationAt: null,
    };
  }

  async findClothingReports(query: any) {
    // Extract pagination and sorting parameters
    const { page, limit, orderBy, orderDir, cancellationStatus, ...conditions } =
      query;
    
    // Build query with join to approval, approval_date_ranges, and EMPLOYEE
    let dbQuery = this.knexService.knex('approval_clothing_expense')
      .leftJoin('approval', 'approval_clothing_expense.approval_id', 'approval.id')
      .leftJoin('EMPLOYEE', 'approval_clothing_expense.employee_code', 'EMPLOYEE.CODE')
      // #259.2 follow-up: คนนอกมี employee_code เป็น UUID ไม่อยู่ใน EMPLOYEE
      // ดึงชื่อจาก approval_staff_members แทนเมื่อ EMPLOYEE.NAME เป็น null
      .leftJoin(
        'approval_staff_members as asm',
        'approval_clothing_expense.staff_member_id',
        'asm.id',
      )
      .whereNull('approval.deleted_at') // Exclude soft deleted records
      .select(
        'approval_clothing_expense.id',
        'approval_clothing_expense.clothing_file_checked',
        'approval_clothing_expense.clothing_amount',
        'approval_clothing_expense.clothing_reason',
        'approval_clothing_expense.reporting_date',
        'approval_clothing_expense.next_claim_date',
        'approval_clothing_expense.work_start_date',
        'approval_clothing_expense.work_end_date',
        'approval_clothing_expense.is_cancelled',
        'approval_clothing_expense.cancelled_at',
        'approval_clothing_expense.cancellation_request_id',
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
        'approval.travel_type as approval_travel_type',
        'approval.created_employee_code',
        'approval.created_employee_name',
        this.knexService.knex.raw(
          'COALESCE("EMPLOYEE"."NAME", "asm"."name") as "employee_name"',
        ),
      );

    // Add date range conditions - matches against the actual travel dates
    // on approval_clothing_expense (work_start_date/work_end_date), not
    // approval.approval_date (approval date). Only one side given: exact
    // match on that single day. Both given: a real range search.
    if (conditions.startDate && conditions.endDate) {
      dbQuery = dbQuery.whereRaw(
        'COALESCE("approval_clothing_expense"."work_end_date", "approval_clothing_expense"."work_start_date") >= ? AND "approval_clothing_expense"."work_start_date" <= ?',
        [conditions.startDate, conditions.endDate],
      );
    } else if (conditions.startDate) {
      dbQuery = dbQuery.where('approval_clothing_expense.work_start_date', conditions.startDate);
    } else if (conditions.endDate) {
      dbQuery = dbQuery.where('approval_clothing_expense.work_start_date', conditions.endDate);
    }

    // Add employee name filter if provided (รวมคนนอกผ่าน asm.name)
    if (conditions.employeeName) {
      dbQuery = dbQuery.whereRaw(
        'COALESCE("EMPLOYEE"."NAME", "asm"."name") LIKE ?',
        [`%${conditions.employeeName}%`],
      );
    }

    this.applyClothingCancellationStatusFilter(dbQuery, cancellationStatus);

    // Add order by
    const orderByField = orderBy || 'approval_clothing_expense.created_at';
    const orderDirection = orderDir || 'desc';
    dbQuery = dbQuery.orderBy(orderByField, orderDirection);

    // Get total count for pagination (without ORDER BY)
    const countQuery = this.knexService.knex('approval_clothing_expense')
      .leftJoin('approval', 'approval_clothing_expense.approval_id', 'approval.id')
      .leftJoin('EMPLOYEE', 'approval_clothing_expense.employee_code', 'EMPLOYEE.CODE')
      .leftJoin(
        'approval_staff_members as asm',
        'approval_clothing_expense.staff_member_id',
        'asm.id',
      )
      .whereNull('approval.deleted_at'); // Exclude soft deleted records

    // Apply the same filters to count query
    if (conditions.startDate && conditions.endDate) {
      countQuery.whereRaw(
        'COALESCE("approval_clothing_expense"."work_end_date", "approval_clothing_expense"."work_start_date") >= ? AND "approval_clothing_expense"."work_start_date" <= ?',
        [conditions.startDate, conditions.endDate],
      );
    } else if (conditions.startDate) {
      countQuery.where('approval_clothing_expense.work_start_date', conditions.startDate);
    } else if (conditions.endDate) {
      countQuery.where('approval_clothing_expense.work_start_date', conditions.endDate);
    }
    if (conditions.employeeName) {
      countQuery.whereRaw(
        'COALESCE("EMPLOYEE"."NAME", "asm"."name") LIKE ?',
        [`%${conditions.employeeName}%`],
      );
    }
    this.applyClothingCancellationStatusFilter(countQuery, cancellationStatus);

    const total = await countQuery.count('* as count').first();

    // Add pagination
    const pageNum = page || 1;
    const limitNum = limit || 10;
    const offset = (pageNum - 1) * limitNum;
    
    dbQuery = dbQuery.limit(limitNum).offset(offset);

    // Execute query
    const data = await dbQuery;

    // Get date ranges for all approvals
    const approvalIds = [...new Set(data.map(item => item.approval_id).filter(id => id))];
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

    let cancellationRequests: any[] = [];
    if (approvalIds.length > 0) {
      cancellationRequests = await this.knexService
        .knex('clothing_expense_cancellation_requests')
        .whereIn('approval_id', approvalIds)
        .whereIn('status', ['pending', 'approved'])
        .select(
          'id',
          'approval_id',
          'status',
          'creator_name',
          'approved_by_name',
          'approved_at',
          'created_at',
          'updated_at',
          'selected_staff_ids',
        );
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

    // Transform data and add date ranges + cancellation info
    const transformedData = await Promise.all(data.map(async (item) => {
      const transformedItem = await toCamelCase<ClothingReport>(item);
      const cancellation = this.resolveClothingReportCancellation(
        item,
        cancellationRequests,
      );
      return {
        ...(transformedItem as any),
        approvalDateRanges: dateRangeMap.get(item.approval_id) || [],
        ...cancellation,
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
      dbQuery = dbQuery.whereBetween('audit_logs.created_at', [
        this.knexService.knex.raw('TO_DATE(?, \'YYYY-MM-DD\')', [conditions.startDate]),
        this.knexService.knex.raw('TO_DATE(?, \'YYYY-MM-DD HH24:MI:SS\')', [conditions.startDate + ' 23:59:59']),
      ]);
    } else if (conditions.endDate) {
      // Only end date provided - match that single day only (same as ตั้งแต่วันที่ alone)
      dbQuery = dbQuery.whereBetween('audit_logs.created_at', [
        this.knexService.knex.raw('TO_DATE(?, \'YYYY-MM-DD\')', [conditions.endDate]),
        this.knexService.knex.raw('TO_DATE(?, \'YYYY-MM-DD HH24:MI:SS\')', [conditions.endDate + ' 23:59:59']),
      ]);
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
      countQuery.whereBetween('audit_logs.created_at', [
        this.knexService.knex.raw('TO_DATE(?, \'YYYY-MM-DD\')', [conditions.startDate]),
        this.knexService.knex.raw('TO_DATE(?, \'YYYY-MM-DD HH24:MI:SS\')', [conditions.startDate + ' 23:59:59']),
      ]);
    } else if (conditions.endDate) {
      countQuery.whereBetween('audit_logs.created_at', [
        this.knexService.knex.raw('TO_DATE(?, \'YYYY-MM-DD\')', [conditions.endDate]),
        this.knexService.knex.raw('TO_DATE(?, \'YYYY-MM-DD HH24:MI:SS\')', [conditions.endDate + ' 23:59:59']),
      ]);
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

  // Names used to resolve a plain province/country name out of free-text
  // destination strings (see excel-export.util.ts resolveDestinationName).
  // destination_id on approval_work_locations/approval_trip_entries has no
  // enforced FK constraint and was found to point at stale rows after the
  // provinces/countries lookup tables got reseeded - do not join on it.
  // office_domestic.province_id / office_international.country_id DO have
  // real enforced FK constraints, so resolving destination text -> office
  // name -> province/country via those is reliable.
  async getDestinationNameLists(): Promise<{
    provinceNames: string[];
    countryNames: string[];
    officeLookup: { officeName: string; resolvedName: string }[];
  }> {
    const provinces = await this.knexService.knex('provinces').select('name_th');
    const countries = await this.knexService.knex('countries').select('name_th');
    const domesticOffices = await this.knexService
      .knex('office_domestic as od')
      .leftJoin('provinces as p', 'od.province_id', 'p.id')
      .whereNotNull('p.name_th')
      .select('od.name as office_name', 'p.name_th as resolved_name');
    const internationalOffices = await this.knexService
      .knex('office_international as oi')
      .leftJoin('countries as c', 'oi.country_id', 'c.id')
      .whereNotNull('c.name_th')
      .select('oi.name as office_name', 'c.name_th as resolved_name');

    const officeLookup = [...domesticOffices, ...internationalOffices].map((o) => ({
      officeName: o.OFFICE_NAME || o.office_name,
      resolvedName: o.RESOLVED_NAME || o.resolved_name,
    }));

    return {
      provinceNames: provinces.map((p) => p.NAME_TH || p.name_th),
      countryNames: countries.map((c) => c.NAME_TH || c.name_th),
      officeLookup,
    };
  }
} 