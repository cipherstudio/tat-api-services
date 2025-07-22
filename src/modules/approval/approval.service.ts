import { Injectable, NotFoundException } from '@nestjs/common';
import { Approval } from './entities/approval.entity';
import { ApprovalStatusLabel } from './entities/approval-status-label.entity';
import { CreateApprovalDto } from './dto/create-approval.dto';
import { UpdateApprovalDto } from './dto/update-approval.dto';
import { UpdateApprovalStatusDto } from './dto/update-approval-status.dto';
import { ApprovalQueryOptions } from './interfaces/approval-options.interface';
import { PaginatedResult } from '../../common/interfaces/pagination.interface';
import { RedisCacheService } from '../cache/redis-cache.service';
import { ApprovalRepository } from './repositories/approval.repository';
import { KnexService } from '../../database/knex-service/knex.service';
import { ApprovalDetailResponseDto } from './dto/approval-detail-response.dto';
// import { ApprovalDateRangeDto } from './dto/approval-date-range.dto';
// import { ApprovalContentDto } from './dto/approval-content.dto';
// import { ApprovalTripEntryDto } from './dto/approval-trip-entry.dto';
// import { ApprovalStaffMemberDto } from './dto/approval-staff-member.dto';
import { UpdateClothingExpenseDatesDto } from './dto/update-clothing-expense-dates.dto';
import { CheckClothingExpenseEligibilityDto } from './dto/check-clothing-expense-eligibility.dto';
import { ClothingExpenseEligibilityResponseDto } from './dto/clothing-expense-eligibility-response.dto';
import {
  ApprovalStatisticsResponseDto,
  TravelTypeBreakdownDto,
  StatusBreakdownDto,
  SummaryDto,
  BreakdownDto,
  //StatisticsDataDto,
} from './dto/approval-statistics-response.dto';
import { FilesService } from '../files/files.service';
//import { ApprovalWorkLocationDto } from './dto/approval-work-location.dto';
import { UpdateApprovalContinuousDto } from './dto/update-approval-continuous.dto';
import { ApprovalAttachmentService } from './services/approval-attachment.service';
import * as moment from 'moment-timezone';
import { QueryApprovalsThatHasClothingExpenseDto } from './dto/query-approvals-that-has-clothing-expense';

@Injectable()
export class ApprovalService {
  private readonly CACHE_PREFIX = 'approval';
  private readonly CACHE_TTL = 3600; // 1 hour in seconds

  constructor(
    private readonly approvalRepository: ApprovalRepository,
    private readonly cacheService: RedisCacheService,
    private readonly knexService: KnexService,
    private readonly filesService: FilesService,
    private readonly attachmentService: ApprovalAttachmentService,
  ) {}

  private async generateIncrementId(): Promise<string> {
    // Get current date
    const now = new Date();

    // Convert to Buddhist year and get last 2 digits
    const beYear = now.getFullYear() + 543;
    const yearLastTwoDigits = beYear.toString().slice(-2);

    // Get current month and pad with leading zero
    const currentMonth = (now.getMonth() + 1).toString().padStart(2, '0');

    // Find the last increment ID for current month
    const prefix = `EX${yearLastTwoDigits}${currentMonth}`;
    const result = await this.knexService
      .knex('approval')
      .where('increment_id', 'like', `${prefix}%`)
      .orderBy('increment_id', 'desc')
      .first();

    let sequence = 1;
    if (result?.increment_id) {
      const lastSequence = parseInt(result.increment_id.slice(-5));
      sequence = lastSequence + 1;
    }

    return `${prefix}${sequence.toString().padStart(5, '0')}`;
  }

  private async generateApprovalPrintNumber(): Promise<string> {
    // ex. 0001 : 25680708 : 1720
    const now = new Date();
    const beYear = now.getFullYear() + 543;
    const currentMonth = (now.getMonth() + 1).toString().padStart(2, '0');
    const currentDay = now.getDate().toString().padStart(2, '0');
    const currentTime = now.getHours() * 100 + now.getMinutes();
    const sequence = 1;
    return `${sequence.toString().padStart(4, '0')} : ${beYear}${currentMonth}${currentDay} : ${currentTime}`;
  }

  async create(
    createApprovalDto: CreateApprovalDto,
    employeeCode: string,
    employeeName: string,
  ): Promise<Approval> {
    // Start a transaction
    const trx = await this.knexService.knex.transaction();

    try {
      // Generate increment ID
      const incrementId = await this.generateIncrementId();
      const approvalPrintNumber = await this.generateApprovalPrintNumber();
      const expensePrintNumber = await this.generateApprovalPrintNumber(); // now use same approach

      // Get the approval status label ID
      const approvalStatusLabelId = await this.knexService
        .knex('approval_status_labels')
        .where('status_code', 'DRAFT')
        .select('id')
        .first();

      // Transform data to snake case
      const data = {
        ...createApprovalDto,
        incrementId,
        approvalPrintNumber,
        expensePrintNumber,
        createdEmployeeCode: employeeCode,
        createdEmployeeName: employeeName,
        approvalStatusLabelId: approvalStatusLabelId.id,
      };

      // Create the approval record with increment ID and user ID
      const savedApproval = await this.approvalRepository.create(data);

      // Create the approval status record
      await trx('approval_status_history').insert({
        approval_status_label_id: approvalStatusLabelId.id,
        created_by: employeeCode,
        approval_id: savedApproval.id,
        created_at: new Date(),
        updated_at: new Date(),
      });

      // Commit the transaction
      await trx.commit();

      // Cache the new approval
      await this.cacheService.set(
        this.cacheService.generateKey(this.CACHE_PREFIX, savedApproval.id),
        savedApproval,
        this.CACHE_TTL,
      );

      // Invalidate the list cache
      await this.cacheService.del(
        this.cacheService.generateListKey(this.CACHE_PREFIX),
      );

      return savedApproval;
    } catch (error) {
      // Rollback the transaction in case of error
      await trx.rollback();
      throw error;
    }
  }

  async findAll(
    queryOptions?: ApprovalQueryOptions,
    employeeCode?: string,
  ): Promise<PaginatedResult<Approval>> {
    const {
      page = 1,
      limit = 10,
      orderBy = 'createdAt',
      orderDir = 'DESC',
      // includeInactive = false,
      name,
      searchTerm,
      latestApprovalStatus,
      incrementId,
      urgencyLevel,
      confidentialityLevel,
      documentTitle,
      approvalRequestStartDate,
      approvalRequestEndDate,
      isRelatedToMe,
      isMyApproval,
    } = queryOptions || {};

    // Try to get from cache first
    const cacheKey = this.cacheService.generateListKey(
      this.CACHE_PREFIX,
      JSON.stringify(queryOptions),
    );
    const cachedResult =
      await this.cacheService.get<PaginatedResult<Approval>>(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    // Validate pagination parameters
    const validatedPage = Math.max(1, Math.floor(Number(page)) || 1);
    const validatedLimit = Math.max(
      1,
      Math.min(100, Math.floor(Number(limit)) || 10),
    );
    const validatedOffset = (validatedPage - 1) * validatedLimit;

    // Prepare conditions
    const conditions: Record<string, any> = {};

    if (name) {
      conditions.name = name;
    }

    if (urgencyLevel) {
      conditions.urgency_level = urgencyLevel;
    }

    if (confidentialityLevel) {
      conditions.confidentiality_level = confidentialityLevel;
    }

    // user can see only their own approvals (unless they are checking for approvals to review)
    if (employeeCode && !isRelatedToMe && !isMyApproval) {
      conditions.created_employee_code = employeeCode;
    }

    // Add soft delete condition
    conditions.deleted_at = null;

    // Convert orderBy from camelCase to snake_case if needed and ensure table prefix
    const dbOrderBy =
      orderBy === 'createdAt'
        ? 'approval.created_at'
        : orderBy === 'updatedAt'
          ? 'approval.updated_at'
          : orderBy.startsWith('approval.')
            ? orderBy
            : `approval.${orderBy}`;

    let approvalStatusLabelId: number = null;
    if (latestApprovalStatus) {
      const statusLabel = await this.knexService
        .knex('approval_status_labels')
        .where('status_code', latestApprovalStatus)
        .select('id')
        .first();

      approvalStatusLabelId = statusLabel?.id || null;
    }

    // Build query with LIKE conditions
    let query = this.knexService.knex('approval').where(conditions);

    // Add JOIN for isRelatedToMe filter
    if (isRelatedToMe) {
      // ถ้าเราเป็นคนในคณะเดินทาง หรือมีส่วนในการอนุมัติส่งเรื่อง หรือถูกทำแทน (ไม่ได้เป็นคนสร้างเรื่อง)
      // ใช้ subquery เพื่อป้องกันข้อมูลซ้ำ
      const relatedApprovalIds = this.knexService.knex
        .select('approval.id')
        .from('approval')
        .leftJoin(
          'approval_staff_members',
          'approval.id',
          'approval_staff_members.approval_id',
        )
        .leftJoin('approval_continuous as ac', function () {
          this.on('approval.id', '=', 'ac.approval_id').andOnVal(
            'ac.employee_code',
            '=',
            employeeCode,
          );
        })
        .where(function () {
          // ✅ เงื่อนไขที่ 1: เป็นคณะเดินทาง
          this.where('approval_staff_members.employee_code', employeeCode)
            // ✅ เงื่อนไขที่ 2: เป็นผู้อนุมัติ
            .orWhereNotNull('ac.id')
            // ✅ เงื่อนไขที่ 3: ถูกทำแทน
            .orWhere(function () {
              this.where('approval.record_type', 'delegate').andWhere(
                'approval.employee_code',
                employeeCode,
              );
            });
        })
        .groupBy('approval.id');

      query = query.whereIn('approval.id', relatedApprovalIds);
    }

    // Add filter for my approval
    if (isMyApproval) {
      query = query.where('approval.continuous_employee_code', employeeCode);
    }

    // Add JOIN for status labels (always join to get status information)
    query = query
      .leftJoin(
        'approval_status_labels as asl',
        'approval.approval_status_label_id',
        'asl.id',
      )
      .leftJoin('OP_MASTER_T', (builder) => {
        builder.on(
          'approval.employee_code',
          '=',
          this.knexService.knex.raw('RTRIM("OP_MASTER_T"."PMT_CODE")'),
        );
      });

    // Add LIKE conditions for incrementId and documentTitle
    if (incrementId) {
      query = query.where('increment_id', 'like', `%${incrementId}%`);
    }

    if (documentTitle) {
      query = query.where('document_title', 'like', `%${documentTitle}%`);
    }

    // Add date range conditions for approval request date (approval_date)
    if (approvalRequestStartDate && approvalRequestEndDate) {
      // Both dates provided - filter by date range
      query = query.whereBetween('approval_date', [
        approvalRequestStartDate,
        approvalRequestEndDate,
      ]);
    } else if (approvalRequestStartDate) {
      // Only start date provided - filter from start date onwards
      query = query.where('approval_date', '>=', approvalRequestStartDate);
    } else if (approvalRequestEndDate) {
      // Only end date provided - filter up to end date
      query = query.where('approval_date', '<=', approvalRequestEndDate);
    }

    // Add latest approval status filter
    if (latestApprovalStatus && approvalStatusLabelId) {
      query = query.where(
        'approval.approval_status_label_id',
        approvalStatusLabelId,
      );
    } else if (latestApprovalStatus && !approvalStatusLabelId) {
      // If status code not found, return empty result
      query = query.where('approval.id', 0); // This will return no results
    }

    // join file table (attachment_id, signature_attachment_id)
    query = query.leftJoin('files as f', 'approval.attachment_id', 'f.id');
    query = query.leftJoin(
      'files as sf',
      'approval.signature_attachment_id',
      'sf.id',
    );

    // Get approvals with pagination
    const [countResult, approvals] = await Promise.all([
      query.clone().count('* as count').first(),
      query
        .clone()
        .select(
          'approval.id',
          'approval.increment_id as incrementId',
          'approval.record_type as recordType',
          'approval.name',
          'approval.employee_code as employeeCode',
          'approval.travel_type as travelType',
          'approval.international_sub_option as internationalSubOption',
          'approval.approval_ref as approvalRef',
          'approval.work_start_date as workStartDate',
          'approval.work_end_date as workEndDate',
          'approval.start_country as startCountry',
          'approval.end_country as endCountry',
          'approval.remarks',
          'approval.num_travelers as numTravelers',
          'approval.document_no as documentNo',
          'approval.document_tel as documentTel',
          'approval.document_to as documentTo',
          'approval.document_title as documentTitle',
          'approval.attachment_id as attachmentId',
          'approval.form3_total_outbound as form3TotalOutbound',
          'approval.form3_total_inbound as form3TotalInbound',
          'approval.form3_total_amount as form3TotalAmount',
          'approval.exceed_lodging_rights_checked as exceedLodgingRightsChecked',
          'approval.exceed_lodging_rights_reason as exceedLodgingRightsReason',
          'approval.form4_total_amount as form4TotalAmount',
          'approval.form5_total_amount as form5TotalAmount',
          'approval.approval_date as approvalDate',
          'approval.staff',
          'approval.staff_employee_code as staffEmployeeCode',
          'approval.final_staff_employee_code as finalStaffEmployeeCode',
          'approval.confidentiality_level as confidentialityLevel',
          'approval.urgency_level as urgencyLevel',
          'approval.comments',
          'approval.final_staff as finalStaff',
          'approval.signer_date as signerDate',
          'approval.document_ending as documentEnding',
          'approval.document_ending_wording as documentEndingWording',
          'approval.signer_name as signerName',
          'approval.use_file_signature as useFileSignature',
          'approval.signature_attachment_id as signatureAttachmentId',
          'approval.use_system_signature as useSystemSignature',
          'approval.approval_print_number as approvalPrintNumber',
          'approval.expense_print_number as expensePrintNumber',
          'approval.created_employee_code as createdEmployeeCode',
          'approval.created_employee_name as createdEmployeeName',
          'approval.created_at as createdAt',
          'approval.updated_at as updatedAt',
          'approval.deleted_at as deletedAt',
          // joined columns
          'asl.label as latestApprovalStatus',
          'asl.updated_at as latestStatusCreatedAt',
          'OP_MASTER_T.PMT_NAME_T as employeeName',
          'f.original_name as attachmentFileName',
          'f.path as attachmentFilePath',
          'sf.original_name as signatureAttachmentFileName',
          'sf.path as signatureAttachmentFilePath',
        )
        .orderBy(dbOrderBy, orderDir.toLowerCase() as 'asc' | 'desc')
        .orderBy('approval.created_at', 'desc')
        .limit(validatedLimit)
        .offset(validatedOffset),
    ]);

    const total = Number(countResult?.count || 0);

    // Get approval IDs for date ranges query
    const approvalIds = approvals.map((approval) => approval.id);

    // Get date ranges for each approval
    let dateRanges = [];
    let clothingExpenses = [];
    let budgets = [];
    let continuousApproval = [];
    let allAttachments: any[] = [];

    if (approvalIds.length > 0) {
      // Get all date ranges for each approval
      const dateRangePromises = approvalIds.map(async (approvalId) => {
        const dateRangesForApproval = await this.knexService
          .knex('approval_date_ranges')
          .select('approval_id', 'start_date', 'end_date')
          .where('approval_id', approvalId)
          .orderBy('start_date', 'asc');
        return dateRangesForApproval;
      });

      dateRanges = await Promise.all(dateRangePromises);

      // Get all clothing expenses for each approval with file information
      const clothingExpensePromises = approvalIds.map(async (approvalId) => {
        const clothingExpensesForApproval = await this.knexService
          .knex('approval_clothing_expense as ace')
          .leftJoin('files as f', 'ace.attachment_id', 'f.id')
          .select(
            'ace.approval_id as approvalId',
            'ace.clothing_file_checked as clothingFileChecked',
            'ace.clothing_amount as clothingAmount',
            'ace.clothing_reason as clothingReason',
            'ace.attachment_id as attachmentId',
            'ace.reporting_date as reportingDate',
            'ace.next_claim_date as nextClaimDate',
            'ace.work_end_date as workEndDate',
            'f.original_name as attachmentFileName',
            'f.path as attachmentFilePath',
          )
          .where('ace.approval_id', approvalId);
        return clothingExpensesForApproval;
      });

      clothingExpenses = await Promise.all(clothingExpensePromises);

      // Get all budgets for each approval with file information
      const budgetPromises = approvalIds.map(async (approvalId) => {
        const budgetsForApproval = await this.knexService
          .knex('approval_budgets as ab')
          .leftJoin('files as f', 'ab.attachment_id', 'f.id')
          .select(
            'ab.approval_id as approvalId',
            'ab.budget_type as budgetType',
            'ab.item_type as itemType',
            'ab.reservation_code as reservationCode',
            'ab.department',
            'ab.budget_code as budgetCode',
            'ab.attachment_id as attachmentId',
            'f.original_name as attachmentFileName',
            'f.path as attachmentFilePath',
          )
          .where('ab.approval_id', approvalId);
        return budgetsForApproval;
      });

      budgets = await Promise.all(budgetPromises);

      // get continuous approval
      const continuousApprovalPromises = approvalIds.map(async (approvalId) => {
        const continuousApproval = await this.knexService
          .knex('approval_continuous as ac')
          .where('ac.approval_id', approvalId)
          .leftJoin(
            'approval_continuous_status as acs',
            'ac.approval_continuous_status_id',
            'acs.id',
          )
          .select(
            'ac.id',
            'ac.approval_id as approvalId',
            'ac.employee_code as employeeCode',
            'ac.signer_name as signerName',
            'ac.signer_date as signerDate',
            'ac.document_ending as documentEnding',
            'ac.document_ending_wording as documentEndingWording',
            'ac.use_file_signature as useFileSignature',
            'ac.signature_attachment_id as signatureAttachmentId',
            'ac.use_system_signature as useSystemSignature',
            'ac.comments as comments',
            'acs.status_code as statusCode',
            'acs.label as statusLabel',
          );
        return continuousApproval;
      });

      continuousApproval = await Promise.all(continuousApprovalPromises);

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
        return [
          ...documentAtts,
          ...signatureAtts,
          ...budgetAtts,
          ...clothingAtts,
          ...continuousAtts,
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

    // Combine approvals with their date ranges (status is already included from JOIN)
    const data = approvals.map((approval, index) => {
      // รวมไฟล์แนบ approval_attachments ทุกประเภท
      const allAtts =
        allAttachments[index] && allAttachments[index].length > 0
          ? allAttachments[index]
          : [];
      return {
        ...approval,
        approvalDateRanges: dateRangeMap.get(approval.id) || [],
        attachments: allAtts,
        clothingExpenses:
          clothingExpenses.find(
            (expenseArray) =>
              expenseArray.length > 0 &&
              expenseArray[0]?.approvalId === approval.id,
          ) || [],
        approvalBudgets:
          budgets.find(
            (budgetArray) =>
              budgetArray.length > 0 &&
              budgetArray[0]?.approvalId === approval.id,
          ) || [],
        continuousApproval:
          continuousApproval.find(
            (continuousApprovalArray) =>
              continuousApprovalArray.length > 0 &&
              continuousApprovalArray[0]?.approvalId === approval.id,
          ) || [],
      };
    });

    // Apply additional filters (searchTerm only)
    let filteredData = data;

    // Filter by search term
    if (searchTerm && data.length > 0) {
      filteredData = filteredData.filter((item) =>
        item.documentTitle?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    const result = {
      data: filteredData,
      meta: {
        total: total, // ใช้ total จาก database query (รวม LIKE conditions และ latestApprovalStatus)
        page: validatedPage,
        limit: validatedLimit,
        totalPages: Math.ceil(total / validatedLimit),
        lastPage: Math.ceil(total / validatedLimit),
      },
    };

    // Cache the result
    await this.cacheService.set(cacheKey, result, this.CACHE_TTL);

    return result;
  }

  // async findAll(queryOptions: ApprovalQueryOptions) {
  //   // Filter out undefined and null values
  //   const filteredConditions = Object.entries(queryOptions).reduce(
  //     (acc, [key, value]) => {
  //       if (value !== undefined && value !== null) {
  //         acc[key] = value;
  //       }
  //       return acc;
  //     },
  //     {} as Record<string, any>,
  //   );

  //   const {
  //     page = 1,
  //     limit = 10,
  //     orderBy = 'createdAt',
  //     orderDir = 'DESC',
  //     ...conditions
  //   } = filteredConditions;

  //   return this.approvalRepository.findWithPaginationAndSearch(
  //     page,
  //     limit,
  //     conditions,
  //     orderBy,
  //     orderDir as 'asc' | 'desc',
  //   );
  // }

  async findById(id: number): Promise<ApprovalDetailResponseDto> {
    // Try to get from cache first
    const cacheKey = this.cacheService.generateKey(this.CACHE_PREFIX, id);
    const cachedApproval =
      await this.cacheService.get<ApprovalDetailResponseDto>(cacheKey);
    if (cachedApproval) {
      return cachedApproval;
    }

    // Add soft delete condition to the query
    const approval = await this.knexService
      .knex('approval')
      .where('approval.id', id)
      .whereNull('approval.deleted_at')
      .select(
        'approval.id',
        'approval.increment_id as incrementId',
        'approval.record_type as recordType',
        'approval.name',
        'approval.employee_code as employeeCode',
        'approval.travel_type as travelType',
        'approval.international_sub_option as internationalSubOption',
        'approval.approval_ref as approvalRef',
        'approval.work_start_date as workStartDate',
        'approval.work_end_date as workEndDate',
        'approval.start_country as startCountry',
        'approval.end_country as endCountry',
        'approval.remarks',
        'approval.num_travelers as numTravelers',
        'approval.document_no as documentNo',
        'approval.document_tel as documentTel',
        'approval.document_to as documentTo',
        'approval.document_title as documentTitle',
        'approval.attachment_id as attachmentId',
        'approval.form3_total_outbound as form3TotalOutbound',
        'approval.form3_total_inbound as form3TotalInbound',
        'approval.form3_total_amount as form3TotalAmount',
        'approval.exceed_lodging_rights_checked as exceedLodgingRightsChecked',
        'approval.exceed_lodging_rights_reason as exceedLodgingRightsReason',
        'approval.form4_total_amount as form4TotalAmount',
        'approval.form5_total_amount as form5TotalAmount',
        'approval.approval_date as approvalDate',
        'approval.staff',
        'approval.staff_employee_code as staffEmployeeCode',
        'approval.confidentiality_level as confidentialityLevel',
        'approval.urgency_level as urgencyLevel',
        'approval.comments',
        'approval.final_staff as finalStaff',
        'approval.final_staff_employee_code as finalStaffEmployeeCode',
        'approval.signer_date as signerDate',
        'approval.document_ending as documentEnding',
        'approval.document_ending_wording as documentEndingWording',
        'approval.signer_name as signerName',
        'approval.use_file_signature as useFileSignature',
        'approval.signature_attachment_id as signatureAttachmentId',
        'approval.use_system_signature as useSystemSignature',
        'approval.created_at as createdAt',
        'approval.updated_at as updatedAt',
        'approval.deleted_at as deletedAt',
        'approval.approval_print_number as approvalPrintNumber',
        'approval.expense_print_number as expensePrintNumber',
        'approval.created_employee_code as createdEmployeeCode',
        'approval.created_employee_name as createdEmployeeName',
        'approval.continuous_employee_code as continuousEmployeeCode',
        'asl.label as currentStatus',
      )
      .join(
        'approval_status_labels as asl',
        'approval.approval_status_label_id',
        'asl.id',
      )
      .first();

    if (!approval) {
      throw new NotFoundException(`Approval with ID ${id} not found`);
    }

    // Map the approval data to the response DTO
    const approvalDto: ApprovalDetailResponseDto = {
      ...approval,
      departments: approval.departments
        ? JSON.parse(approval.departments)
        : undefined,
      degrees: approval.degrees ? JSON.parse(approval.degrees) : undefined,
      finalDepartments: approval.final_departments
        ? JSON.parse(approval.final_departments)
        : undefined,
      finalDegrees: approval.final_degrees
        ? JSON.parse(approval.final_degrees)
        : undefined,
    };

    // Get status history
    const statusHistory = await this.knexService
      .knex('approval_status_history as ash')
      .join(
        'approval_status_labels as asl',
        'ash.approval_status_label_id',
        'asl.id',
      )
      .where('ash.approval_id', id)
      .orderBy('ash.created_at', 'desc')
      .select(
        'ash.id',
        'asl.label as status',
        'ash.created_by as createdBy',
        'ash.created_at as createdAt',
      );

    // Get travel date ranges
    const travelDateRanges = await this.knexService
      .knex('approval_date_ranges')
      .where('approval_id', id)
      .select('id', 'start_date as startDate', 'end_date as endDate');

    // Get approval contents
    const approvalContents = await this.knexService
      .knex('approval_contents')
      .where('approval_id', id)
      .select('id', 'detail');

    // Get trip entries
    const tripEntries = await this.knexService
      .knex('approval_trip_entries')
      .where('approval_id', id)
      .select(
        'id',
        'location',
        'destination',
        'nearby_provinces as nearbyProvinces',
        'details',
        'destination_type as destinationType',
        'destination_id as destinationId',
        'destination_table as destinationTable',
      );

    // Get trip date ranges for each trip entry
    for (const tripEntry of tripEntries) {
      const tripDateRanges = await this.knexService
        .knex('approval_trip_date_ranges')
        .where('approval_trip_entries_id', tripEntry.id)
        .select('id', 'start_date as startDate', 'end_date as endDate');
      tripEntry.tripDateRanges = tripDateRanges;
    }

    // Get staff members
    const staffMembersQuery = this.knexService
      .knex('approval_staff_members as asm')
      .leftJoin('OP_MASTER_T as omt', 'asm.employee_code', 'omt.PMT_CODE')
      .leftJoin('EMPLOYEE as et', 'asm.employee_code', 'et.CODE')
      .where('asm.approval_id', id);

    const staffMembersSubQuery = staffMembersQuery
      .clone()
      .select([
        'asm.id',
        'asm.employee_code as employeeCode',
        'asm.type',
        'asm.name',
        'asm.role',
        'asm.position',
        'asm.right_equivalent as rightEquivalent',
        'asm.organization_position as organizationPosition',
        'omt.PMT_LEVEL_CODE as viewLevel',
        'et.POSITION as viewPosition',
        this.knexService.knex.raw(
          `row_number() over (partition by "asm"."id" order by "asm"."id" asc) as "rn"`,
        ),
      ])
      .as('sub');

    const staffMembersFinalQuery = this.knexService
      .knex(staffMembersSubQuery)
      .where('rn', 1)
      .select('*');

    const staffMembers = await staffMembersFinalQuery;

    // Get work locations for each staff member
    for (const staffMember of staffMembers) {
      const workLocations = await this.knexService
        .knex('approval_work_locations')
        .where('staff_member_id', staffMember.id)
        .where('approval_id', id)
        .select(
          'id',
          'location',
          'destination',
          'nearby_provinces as nearbyProvinces',
          'details',
          'checked',
          'destination_type as destinationType',
          'destination_id as destinationId',
          'destination_table as destinationTable',
        );

      // Get trip date ranges for each work location
      for (const workLocation of workLocations) {
        const workLocationTripDateRanges = await this.knexService
          .knex('approval_work_locations_date_ranges')
          .where('approval_work_locations_id', workLocation.id)
          .where('approval_id', id)
          .select('id', 'start_date as startDate', 'end_date as endDate');
        workLocation.tripDateRanges = workLocationTripDateRanges;
      }

      // Get transportation expenses for each work location
      for (const workLocation of workLocations) {
        const transportationExpenses = await this.knexService
          .knex('approval_transportation_expense')
          .where('work_location_id', workLocation.id)
          .where('staff_member_id', staffMember.id)
          .where('approval_id', id)
          .select(
            'id',
            'travel_type as travelType',
            'expense_type as expenseType',
            'travel_method as travelMethod',
            'outbound_origin as outboundOrigin',
            'outbound_destination as outboundDestination',
            'outbound_trips as outboundTrips',
            'outbound_expense as outboundExpense',
            'outbound_total as outboundTotal',
            'inbound_origin as inboundOrigin',
            'inbound_destination as inboundDestination',
            'inbound_trips as inboundTrips',
            'inbound_expense as inboundExpense',
            'inbound_total as inboundTotal',
            'total_amount as totalAmount',
          );
        workLocation.transportationExpenses = transportationExpenses;
      }

      // Get accommodation expenses for each work location
      for (const workLocation of workLocations) {
        const accommodationExpenses = await this.knexService
          .knex('approval_accommodation_expense')
          .where('work_location_id', workLocation.id)
          .where('staff_member_id', staffMember.id)
          .where('approval_id', id)
          .select(
            'id',
            'total_amount as totalAmount',
            'has_meal_out as hasMealOut',
            'has_meal_in as hasMealIn',
            'meal_out_amount as mealOutAmount',
            'meal_in_amount as mealInAmount',
            'meal_out_count as mealOutCount',
            'meal_in_count as mealInCount',
            'allowance_out_checked as allowanceOutChecked',
            'allowance_out_rate as allowanceOutRate',
            'allowance_out_days as allowanceOutDays',
            'allowance_out_total as allowanceOutTotal',
            'allowance_in_checked as allowanceInChecked',
            'allowance_in_rate as allowanceInRate',
            'allowance_in_days as allowanceInDays',
            'allowance_in_total as allowanceInTotal',
            'lodging_fixed_checked as lodgingFixedChecked',
            'lodging_double_checked as lodgingDoubleChecked',
            'lodging_single_checked as lodgingSingleChecked',
            'lodging_nights as lodgingNights',
            'lodging_rate as lodgingRate',
            'lodging_double_nights as lodgingDoubleNights',
            'lodging_double_rate as lodgingDoubleRate',
            'lodging_single_nights as lodgingSingleNights',
            'lodging_single_rate as lodgingSingleRate',
            'lodging_double_person as lodgingDoublePerson',
            'lodging_double_person_external as lodgingDoublePersonExternal',
            'lodging_total as lodgingTotal',
            'moving_cost_checked as movingCostChecked',
            'moving_cost_rate as movingCostRate',
          );

        // Get accommodation transport expenses for each accommodation expense
        for (const accommodationExpense of accommodationExpenses) {
          const accommodationTransportExpenses = await this.knexService
            .knex('approval_accommodation_transport_expense')
            .where('approval_accommodation_expense_id', accommodationExpense.id)
            .where('approval_id', id)
            .select(
              'id',
              'type',
              'amount',
              'checked',
              'flight_route as flightRoute',
            );
          accommodationExpense.accommodationTransportExpenses =
            accommodationTransportExpenses;

          // Get accommodation holiday expenses for each accommodation expense
          const accommodationHolidayExpenses = await this.knexService
            .knex('approval_accommodation_holiday_expense')
            .where('approval_accommodation_expense_id', accommodationExpense.id)
            .where('approval_id', id)
            .select(
              'id',
              'date',
              'thai_date as thaiDate',
              'checked',
              'time',
              'hours',
              'total',
              'note',
            );
          accommodationExpense.accommodationHolidayExpenses =
            accommodationHolidayExpenses;
        }

        workLocation.accommodationExpenses = accommodationExpenses;
      }

      staffMember.workLocations = workLocations;

      // Get entertainment expenses for each staff member
      const entertainmentExpenses = await this.knexService
        .knex('approval_entertainment_expense')
        .where('staff_member_id', staffMember.id)
        .where('approval_id', id)
        .select(
          'id',
          'entertainment_short_checked as entertainmentShortChecked',
          'entertainment_long_checked as entertainmentLongChecked',
          'entertainment_amount as entertainmentAmount',
        );
      staffMember.entertainmentExpenses = entertainmentExpenses;

      // Get clothing expenses for each staff member
      const clothingExpenses = await this.knexService
        .knex('approval_clothing_expense')
        .where('employee_code', staffMember.employeeCode)
        .where('approval_id', id)
        .select(
          'id',
          'clothing_file_checked as clothingFileChecked',
          'clothing_amount as clothingAmount',
          'clothing_reason as clothingReason',
          'reporting_date as reportingDate',
          'next_claim_date as nextClaimDate',
          'work_end_date as workEndDate',
          'increment_id as incrementId',
          'destination_country as destinationCountry',
          'attachment_id as clothingAttachmentId',
        );
      staffMember.clothingExpenses = clothingExpenses;
    }

    // Get other expenses
    const otherExpenses = await this.knexService
      .knex('approval_other_expense')
      .where('approval_id', id)
      .select('id', 'type', 'amount', 'position', 'reason', 'acknowledged');

    // Get conditions
    const conditions = await this.knexService
      .knex('approval_conditions')
      .where('approval_id', id)
      .select('id', 'text');

    // Get budgets
    const budgets = await this.knexService
      .knex('approval_budgets')
      .where('approval_id', id)
      .select(
        'id',
        'budget_type as budgetType',
        'item_type as itemType',
        'reservation_code as reservationCode',
        'department',
        'budget_code as budgetCode',
        'attachment_id as budgetAttachmentId',
      );

    // get continuous approval
    const approvalQuery = this.knexService
      .knex('approval_continuous as ac')
      .leftJoin(
        'approval_continuous_status as acs',
        'ac.approval_continuous_status_id',
        'acs.id',
      )
      .leftJoin('EMPLOYEE as et', 'ac.employee_code', 'et.CODE')
      .leftJoin('EMPLOYEE as et2', 'ac.created_by', 'et2.CODE')
      .where('ac.approval_id', id);

    const subQuery = approvalQuery
      .clone()
      .select([
        'ac.id as approvalContinuousId',
        'ac.employee_code as employeeCode', // ผู้รับ
        'et.POSITION as position', // ผู้รับ
        'et.NAME as signerName', // ผู้รับ
        'ac.signer_date as signerDate',
        'ac.document_ending as documentEnding',
        'ac.document_ending_wording as documentEndingWording',
        'ac.use_file_signature as useFileSignature',
        'ac.signature_attachment_id as signatureAttachmentId',
        'ac.use_system_signature as useSystemSignature',
        'ac.comments as comments',
        'ac.created_at as createdAt', // วันที่สร้าง
        'ac.updated_at as updatedAt', // วันที่ส่ง ปรับสถานะ

        // ผู้ส่ง
        'et2.CODE as createdEmployeeCode',
        'et2.NAME as createdName',
        'et2.POSITION as createdPosition',

        'acs.status_code as statusCode',
        'acs.label as statusLabel',
        this.knexService.knex.raw(
          `row_number() over (partition by "ac"."id" order by "ac"."created_at" asc) as "rn"`,
        ),
      ])
      .as('sub');

    const finalQuery = this.knexService
      .knex(subQuery)
      .where('rn', 1)
      .select('*');

    const continuousApproval = await finalQuery;

    // get continuous approval
    // const continuousApproval = await this.knexService
    //   .knex('approval_continuous as ac')
    //   .where('ac.approval_id', id)
    //   .select(
    //     'ac.id',
    //     'ac.employee_code as employeeCode', // ผู้รับ
    //     'et.POSITION as position', // ผู้รับ
    //     'ac.signer_name as signerName', // ผู้รับ
    //     'ac.signer_date as signerDate',
    //     'ac.document_ending as documentEnding',
    //     'ac.document_ending_wording as documentEndingWording',
    //     'ac.use_file_signature as useFileSignature',
    //     'ac.signature_attachment_id as signatureAttachmentId',
    //     'ac.use_system_signature as useSystemSignature',
    //     'ac.comments as comments',
    //     'ac.created_at as createdAt', // วันที่สร้าง
    //     'ac.updated_at as updatedAt', // วันที่ส่ง ปรับสถานะ

    //     // ผู้ส่ง
    //     'u.employee_code as createdEmployeeCode',
    //     'et2.NAME as createdName',
    //     'et2.POSITION as createdPosition',

    //     'acs.status_code as statusCode',
    //     'acs.label as statusLabel'
    //   )
    //   .leftJoin(
    //     'approval_continuous_status as acs',
    //     'ac.approval_continuous_status_id',
    //     'acs.id')
    //   .leftJoin(
    //     'EMPLOYEE as et',
    //     'ac.employee_code',
    //     'et.CODE'
    //   )
    //   .leftJoin(
    //     'users as u',
    //     'ac.created_by',
    //     'u.id'
    //   )
    //   .leftJoin(
    //     'EMPLOYEE as et2',
    //     'u.employee_code',
    //     'et2.CODE'
    //   )
    //   .orderBy('ac.created_at', 'asc');

    const approvalDocuments = await this.attachmentService.getAttachments(
      'approval_document',
      id,
    );
    const approvalSignatures = await this.attachmentService.getAttachments(
      'approval_signature',
      id,
    );

    // Get additional attachments for budgets
    const budgetAttachments = await this.attachmentService.getAttachments(
      'approval_budgets',
      id,
    );
    for (const budget of budgets) {
      budget.attachments = budgetAttachments;
    }

    // Get additional attachments for clothing expenses
    const clothingExpenseAttachments =
      await this.attachmentService.getAttachments(
        'approval_clothing_expense',
        id,
      );
    for (const staffMember of staffMembers) {
      if (staffMember.clothingExpenses) {
        for (const expense of staffMember.clothingExpenses) {
          expense.attachments = clothingExpenseAttachments;
        }
      }
    }

    // Get additional attachments for continuous approval signatures
    const continuousSignatureAttachments =
      await this.attachmentService.getAttachments(
        'approval_continuous_signature',
        id,
      );
    for (const continuous of continuousApproval) {
      continuous.signatureAttachments = continuousSignatureAttachments;
    }

    // Combine all attachments into one array
    const allAttachments = [
      ...approvalDocuments,
      ...approvalSignatures,
      ...budgetAttachments,
      ...clothingExpenseAttachments,
      ...continuousSignatureAttachments,
    ];

    // get approval ref data
    let approvalRefData: {
      id: number;
      incrementId: string;
      name: string;
      employeeCode: string;
      travelType: string;
      documentTitle: string;
      createdAt: Date;
      updatedAt: Date;
    } | null = null;
    if (approval.approvalRef !== null) {
      approvalRefData = await this.knexService
        .knex('approval')
        .where('id', approval.approvalRef)
        .whereNull('deleted_at')
        .select(
          'id',
          'increment_id as incrementId',
          'name',
          'employee_code as employeeCode',
          'travel_type as travelType',
          'document_title as documentTitle',
          'created_at as createdAt',
          'updated_at as updatedAt'
        )
        .first();
    }

    // Combine all the data
    const response: ApprovalDetailResponseDto = {
      ...approvalDto,
      documentAttachments: approvalDocuments,
      signatureAttachments: approvalSignatures,
      attachments: allAttachments,
      statusHistory,
      //currentStatus: statusHistory[0]?.status || 'ฉบับร่าง',
      travelDateRanges,
      approvalContents,
      tripEntries,
      staffMembers,
      otherExpenses,
      conditions,
      budgets,
      continuousApproval: continuousApproval || [],
      approvalRefData: approvalRefData,
    };

    // Cache the result
    await this.cacheService.set(cacheKey, response, this.CACHE_TTL);

    return response;
  }

  async update(
    id: number,
    updateDto: UpdateApprovalDto,
    employeeCode: string,
  ): Promise<Approval> {
    const approval = await this.findById(id);
    if (!approval) {
      throw new NotFoundException(`Approval with ID ${id} not found`);
    }

    // Get current attachment IDs before update for potential cleanup
    const oldAttachmentId = approval.attachmentId;
    const oldSignatureAttachmentId = approval.signatureAttachmentId;

    // Start a transaction
    const trx = await this.knexService.knex.transaction();

    try {
      // Update approval record
      await trx('approval').where('id', id).update({
        approval_ref: updateDto.approvalRef,
        record_type: updateDto.recordType,
        name: updateDto.name,
        employee_code: updateDto.employeeCode,
        travel_type: updateDto.travelType,
        international_sub_option: updateDto.internationalSubOption,
        work_start_date: updateDto.workStartDate,
        work_end_date: updateDto.workEndDate,
        start_country: updateDto.startCountry,
        end_country: updateDto.endCountry,
        remarks: updateDto.remarks,
        num_travelers: updateDto.numTravelers,
        document_no: updateDto.documentNo,
        document_tel: updateDto.documentTel,
        document_to: updateDto.documentTo,
        document_title: updateDto.documentTitle,
        attachment_id: updateDto.attachmentId,
        form3_total_outbound: updateDto.form3TotalOutbound,
        form3_total_inbound: updateDto.form3TotalInbound,
        form3_total_amount: updateDto.form3TotalAmount,
        exceed_lodging_rights_checked: updateDto.exceedLodgingRightsChecked,
        exceed_lodging_rights_reason: updateDto.exceedLodgingRightsReason,
        form4_total_amount: updateDto.form4TotalAmount,
        form5_total_amount: updateDto.form5TotalAmount,
        confidentiality_level: updateDto.confidentialityLevel,
        urgency_level: updateDto.urgencyLevel,
        staff: updateDto.staff,
        staff_employee_code: updateDto.staffEmployeeCode,
        continuous_employee_code: updateDto.staffEmployeeCode,
        comments: updateDto.comments,
        approval_date: updateDto.approvalDate,
        final_staff: updateDto.finalStaff,
        final_staff_employee_code: updateDto.finalStaffEmployeeCode,
        signer_date: updateDto.signerDate,
        document_ending: updateDto.documentEnding,
        document_ending_wording: updateDto.documentEndingWording,
        signer_name: updateDto.signerName,
        use_file_signature: updateDto.useFileSignature,
        signature_attachment_id: updateDto.signatureAttachmentId,
        use_system_signature: updateDto.useSystemSignature,
        updated_at: new Date(),
      });

      // Get the updated approval record
      const updatedApprovalRecord = await trx('approval')
        .where('id', id)
        .first();

      // Process travel date ranges
      if (
        updateDto.travelDateRanges &&
        Array.isArray(updateDto.travelDateRanges)
      ) {
        console.log(
          'Processing travel date ranges:',
          JSON.stringify(updateDto.travelDateRanges, null, 2),
        );
        await trx('approval_date_ranges').where('approval_id', id).delete();
        for (const range of updateDto.travelDateRanges) {
          if (range && typeof range === 'object') {
            await trx('approval_date_ranges').insert({
              approval_id: id,
              start_date: range.start_date,
              end_date: range.end_date,
            });
          }
        }
      }

      // Process approval contents
      if (
        updateDto.approvalContents &&
        Array.isArray(updateDto.approvalContents)
      ) {
        console.log(
          'Processing approval contents:',
          JSON.stringify(updateDto.approvalContents, null, 2),
        );
        await trx('approval_contents').where('approval_id', id).delete();
        for (const content of updateDto.approvalContents) {
          if (content && typeof content === 'object') {
            await trx('approval_contents').insert({
              approval_id: id,
              detail: content.detail,
            });
          }
        }
      }

      // Process trip entries
      if (updateDto.tripEntries && Array.isArray(updateDto.tripEntries)) {
        console.log(
          'Processing trip entries:',
          JSON.stringify(updateDto.tripEntries, null, 2),
        );
        const previousTripEntries = await trx('approval_trip_entries')
          .where('approval_id', id)
          .select('id');
        const previousTripDateRanges = await trx('approval_trip_date_ranges')
          .where('approval_id', id)
          .select('id');

        // delete previous trip entries
        for (const entry of previousTripEntries) {
          await trx('approval_trip_entries').where('id', entry.id).delete();
        }
        // delete previous trip date ranges
        for (const range of previousTripDateRanges) {
          await trx('approval_trip_date_ranges').where('id', range.id).delete();
        }

        for (const entry of updateDto.tripEntries) {
          if (entry && typeof entry === 'object') {
            const [tripEntryId] = await trx('approval_trip_entries')
              .insert({
                approval_id: id,
                location: entry.location,
                destination: entry.destination,
                nearby_provinces: entry.nearbyProvinces,
                details: entry.details,
                destination_type: entry.destinationType,
                destination_id: entry.destinationId,
                destination_table: entry.destinationTable,
              })
              .returning('id');

            if (entry.tripDateRanges && Array.isArray(entry.tripDateRanges)) {
              for (const range of entry.tripDateRanges) {
                if (range && typeof range === 'object') {
                  await trx('approval_trip_date_ranges').insert({
                    approval_id: id,
                    approval_trip_entries_id: tripEntryId.id,
                    start_date: range.start_date,
                    end_date: range.end_date,
                  });
                }
              }
            }
          }
        }
      }

      // Process staff members and their work locations
      if (updateDto.staffMembers && Array.isArray(updateDto.staffMembers)) {
        console.log(
          'Processing staff members:',
          JSON.stringify(updateDto.staffMembers, null, 2),
        );
        await trx('approval_staff_members').where('approval_id', id).delete();
        await trx('approval_work_locations').where('approval_id', id).delete();
        await trx('approval_work_locations_date_ranges')
          .where('approval_id', id)
          .delete();
        await trx('approval_transportation_expense')
          .where('approval_id', id)
          .delete();
        await trx('approval_accommodation_expense')
          .where('approval_id', id)
          .delete();
        await trx('approval_accommodation_transport_expense')
          .where('approval_id', id)
          .delete();
        await trx('approval_accommodation_holiday_expense')
          .where('approval_id', id)
          .delete();
        await trx('approval_entertainment_expense')
          .where('approval_id', id)
          .delete();
        await trx('approval_continuous').where('approval_id', id).delete();
        //await trx('approval_clothing_expense').where('approval_id', id).delete();

        for (const staffMember of updateDto.staffMembers) {
          const [insertedStaffMember] = await trx('approval_staff_members')
            .insert({
              approval_id: id,
              employee_code: staffMember.employeeCode,
              type: staffMember.type,
              name: staffMember.name,
              role: staffMember.role,
              position: staffMember.position,
              right_equivalent: staffMember.rightEquivalent,
              organization_position: staffMember.organizationPosition,
              created_at: new Date(),
              updated_at: new Date(),
            })
            .returning('id');

          // Process work locations
          if (Array.isArray(staffMember.workLocations)) {
            for (const workLocation of staffMember.workLocations) {
              const [workLocationId] = await trx('approval_work_locations')
                .insert({
                  approval_id: id,
                  staff_member_id: insertedStaffMember.id,
                  location: workLocation.location,
                  destination: workLocation.destination,
                  nearby_provinces: workLocation.nearbyProvinces,
                  details: workLocation.details,
                  checked: workLocation.checked,
                  destination_type: workLocation.destinationType,
                  destination_id: workLocation.destinationId,
                  destination_table: workLocation.destinationTable,
                  created_at: new Date(),
                  updated_at: new Date(),
                })
                .returning('id');

              // Process date ranges
              if (Array.isArray(workLocation.tripDateRanges)) {
                for (const dateRange of workLocation.tripDateRanges) {
                  await trx('approval_work_locations_date_ranges').insert({
                    approval_id: id,
                    approval_work_locations_id: workLocationId.id,
                    start_date: dateRange.start_date,
                    end_date: dateRange.end_date,
                    created_at: new Date(),
                    updated_at: new Date(),
                  });
                }
              }

              // Process transportation expenses
              if (Array.isArray(workLocation.transportationExpenses)) {
                for (const expense of workLocation.transportationExpenses) {
                  await trx('approval_transportation_expense').insert({
                    approval_id: id,
                    staff_member_id: insertedStaffMember.id,
                    work_location_id: workLocationId.id,
                    travel_type: expense.travelType,
                    expense_type: expense.expenseType,
                    travel_method: expense.travelMethod,
                    outbound_origin: expense.outbound?.origin,
                    outbound_destination: expense.outbound?.destination,
                    outbound_trips: expense.outbound?.trips,
                    outbound_expense: expense.outbound?.expense,
                    outbound_total: expense.outbound?.total,
                    inbound_origin: expense.inbound?.origin,
                    inbound_destination: expense.inbound?.destination,
                    inbound_trips: expense.inbound?.trips,
                    inbound_expense: expense.inbound?.expense,
                    inbound_total: expense.inbound?.total,
                    total_amount: expense.totalAmount,
                    created_at: new Date(),
                    updated_at: new Date(),
                  });
                }
              }

              // Process accommodation expenses
              if (Array.isArray(workLocation.accommodationExpenses)) {
                for (const expense of workLocation.accommodationExpenses) {
                  const [accommodationExpense] = await trx(
                    'approval_accommodation_expense',
                  )
                    .insert({
                      approval_id: id,
                      staff_member_id: insertedStaffMember.id,
                      work_location_id: workLocationId.id,
                      total_amount: expense.totalAmount,
                      has_meal_out: expense.hasMealOut,
                      has_meal_in: expense.hasMealIn,
                      meal_out_amount: expense.mealOutAmount,
                      meal_in_amount: expense.mealInAmount,
                      meal_out_count: expense.mealOutCount,
                      meal_in_count: expense.mealInCount,
                      allowance_out_checked: expense.allowanceOutChecked,
                      allowance_out_rate: expense.allowanceOutRate,
                      allowance_out_days: expense.allowanceOutDays,
                      allowance_out_total: expense.allowanceOutTotal,
                      allowance_in_checked: expense.allowanceInChecked,
                      allowance_in_rate: expense.allowanceInRate,
                      allowance_in_days: expense.allowanceInDays,
                      allowance_in_total: expense.allowanceInTotal,
                      lodging_fixed_checked: expense.lodgingFixedChecked,
                      lodging_double_checked: expense.lodgingDoubleChecked,
                      lodging_single_checked: expense.lodgingSingleChecked,
                      lodging_nights: expense.lodgingNights,
                      lodging_rate: expense.lodgingRate,
                      lodging_double_nights: expense.lodgingDoubleNights,
                      lodging_double_rate: expense.lodgingDoubleRate,
                      lodging_single_nights: expense.lodgingSingleNights,
                      lodging_single_rate: expense.lodgingSingleRate,
                      lodging_double_person: expense.lodgingDoublePerson,
                      lodging_double_person_external:
                        expense.lodgingDoublePersonExternal,
                      lodging_total: expense.lodgingTotal,
                      moving_cost_checked: expense.movingCostChecked,
                      moving_cost_rate: expense.movingCostRate,
                      created_at: new Date(),
                      updated_at: new Date(),
                    })
                    .returning('id');

                  // Process accommodation transport expenses
                  if (Array.isArray(expense.accommodationTransportExpenses)) {
                    for (const transportExpense of expense.accommodationTransportExpenses) {
                      await trx(
                        'approval_accommodation_transport_expense',
                      ).insert({
                        approval_id: id,
                        approval_accommodation_expense_id:
                          accommodationExpense.id,
                        type: transportExpense.type,
                        amount: transportExpense.amount,
                        checked: transportExpense.checked,
                        flight_route: transportExpense.flightRoute,
                        created_at: new Date(),
                        updated_at: new Date(),
                      });
                    }
                  }

                  // Process accommodation holiday expenses
                  if (
                    Array.isArray(workLocation.accommodationHolidayExpenses)
                  ) {
                    for (const holidayExpense of workLocation.accommodationHolidayExpenses) {
                      await trx(
                        'approval_accommodation_holiday_expense',
                      ).insert({
                        approval_id: id,
                        approval_accommodation_expense_id:
                          accommodationExpense.id,
                        date: holidayExpense.date,
                        thai_date: holidayExpense.thaiDate,
                        checked: holidayExpense.checked,
                        time: holidayExpense.time,
                        hours: holidayExpense.hours,
                        total: holidayExpense.total,
                        note: holidayExpense.note,
                        created_at: new Date(),
                        updated_at: new Date(),
                      });
                    }
                  }
                }
              }

              // Process entertainment expenses
              if (Array.isArray(staffMember.entertainmentExpenses)) {
                for (const expense of staffMember.entertainmentExpenses) {
                  await trx('approval_entertainment_expense').insert({
                    approval_id: id,
                    staff_member_id: insertedStaffMember.id,
                    entertainment_short_checked:
                      expense.entertainmentShortChecked,
                    entertainment_long_checked:
                      expense.entertainmentLongChecked,
                    entertainment_amount: expense.entertainmentAmount,
                    created_at: new Date(),
                    updated_at: new Date(),
                  });
                }
              }

              // Process clothing expenses for each staff member
              if (Array.isArray(staffMember.clothingExpenses)) {
                if (
                  typeof staffMember.employeeCode === 'string' &&
                  staffMember.employeeCode.includes('-')
                ) {
                  continue;
                }

                for (const expense of staffMember.clothingExpenses) {
                  // Check if record exists
                  const existingExpense = await trx('approval_clothing_expense')
                    .where({
                      approval_id: id,
                      employee_code: staffMember.employeeCode,
                    })
                    .first();

                  // get first destination country
                  const destinationCountry = updateDto.tripEntries.find(
                    (trip) => trip.destinationTable === 'countries',
                  )?.destination;

                  // get work end date
                  let workEndDate = null;
                  if (updateDto.travelType === 'temporary-international') {
                    workEndDate = updateDto.workEndDate;
                  }

                  // get next claim date
                  let nextClaimDate = null;
                  let workStartDate = null;
                  if (updateDto.travelType === 'international') {
                    // get work start date from first start date of traveldateranges
                    workStartDate = updateDto.travelDateRanges[0].start_date;
                    const pwJob = await this.getPwJob(staffMember.employeeCode);
                    if (!pwJob) {
                      nextClaimDate =
                        this.calculateNextClaimDate(workStartDate);
                    } else {
                      const organize = await this.knexService
                        .knex('OP_ORGANIZE_R')
                        .where('POG_CODE', pwJob.DEPTID)
                        .first();

                      if (organize.POG_TYPE == 3) {
                        // ต่างประเทศ
                        // หา ประเภท A B C ของ office internatinal จากใบเก่า
                        const oldDestination = await this.knexService
                          .knex('office_international')
                          .where('pog_code', organize.POG_CODE)
                          .join(
                            'countries',
                            'office_international.country_id',
                            'countries.id',
                          )
                          .first();

                        // หา ประเภท A B C ของ current destination employee
                        const destination = updateDto.staffMembers
                          .find(
                            (emp) =>
                              emp.employeeCode === staffMember.employeeCode,
                          )
                          ?.workLocations.find(
                            (location) =>
                              location.destinationTable === 'countries',
                          )?.[0];
                        let currentDestination;
                        if (destination.destinationTable === 'countries') {
                          currentDestination = await this.knexService
                            .knex('countries')
                            .where('id', destination.destinationId)
                            .first();
                        } else if (
                          destination.destinationTable === 'tatOffices'
                        ) {
                          currentDestination = await this.knexService
                            .knex('tat_offices')
                            .where('id', destination.destinationId)
                            .join(
                              'countries',
                              'tat_offices.country_id',
                              'countries.id',
                            )
                            .first();
                        }

                        if (currentDestination && oldDestination) {
                          // ถ้าเป็นประเภท A B C ของ ใบเก่า และ ใบใหม่ ไม่เหมือนกัน
                          if (currentDestination.type !== oldDestination.type) {
                            nextClaimDate =
                              this.calculateNextClaimDate(workStartDate);
                          } else {
                            // ถ้าประเภทเหมือนกัน
                            // ให้เอา EFFDT จาก pwJob มาเช็คกับ checkEligibilityDto.workStartDate ว่าเกิน 2 ปี หรือยัง ถ้าเกินแล้ว, set isEligible true
                            // @todo อาจต้องเปลี่ยนไปเช็ค วันรายงานตัวกับ ViewDutyformCommands (รอคอนเฟิม)
                            const isOverTwoYears = this.isOverTwoYears(
                              pwJob.EFFDT,
                              workStartDate,
                            );
                            if (isOverTwoYears) {
                              // @todo หาวันรายงานตัว
                              const reportingDateDummy = '2024-03-20';
                              nextClaimDate =
                                this.calculateNextClaimDate(reportingDateDummy);
                            } else {
                              nextClaimDate = null;
                            }
                          }
                        } else {
                          // @todo
                        }
                      } else {
                        // ในประเทศ
                        nextClaimDate = null;
                      }
                    }
                  } else if (
                    updateDto.travelType === 'temporary-international'
                  ) {
                    workStartDate = updateDto.workStartDate;
                    const pwJob = await this.getPwJob(staffMember.employeeCode);
                    if (!pwJob) {
                      nextClaimDate =
                        this.calculateNextClaimDate(workStartDate);
                    } else {
                      // ถ้ามี pwJob
                      // @todo ให้เช็คว่า เบิกครั้งก่อนประเภทไหน
                      if (true) {
                        // ex. ประจำ
                        // @todo เช็คว่ามีวันรายงานตัวไหม
                        if (true) {
                          // ex.มีวันรายงานตัว
                          // @todo get วันรายงานตัว
                          const reportingDateDummy = '2024-03-20';
                          nextClaimDate =
                            this.calculateNextClaimDate(reportingDateDummy);
                        } else {
                          // ex.ไม่มีวันรายงานตัว
                          nextClaimDate =
                            this.calculateNextClaimDate(workStartDate);
                        }
                      } else {
                        // ex. ชั่วคราว
                        const isOverTwoYears = this.isOverTwoYears(
                          pwJob.EFFDT,
                          workStartDate,
                        );
                        if (isOverTwoYears) {
                          nextClaimDate =
                            this.calculateNextClaimDate(workStartDate);
                        } else {
                          nextClaimDate = null;
                        }
                      }
                    }
                  }

                  let clothingExpenseId;
                  if (existingExpense) {
                    // Update existing record
                    await trx('approval_clothing_expense')
                      .where({
                        approval_id: id,
                        employee_code: staffMember.employeeCode,
                      })
                      .update({
                        clothing_file_checked: expense.clothingFileChecked,
                        clothing_amount: expense.clothingAmount,
                        clothing_reason: expense.clothingReason,
                        reporting_date: null, // ไม่ต้องส่ง มาจาก cron + manual save
                        next_claim_date: nextClaimDate,
                        work_end_date: workEndDate, // ไม่ต้องส่ง เอามาจาก step 1
                        increment_id: approval.incrementId,
                        destination_country: destinationCountry ?? null,
                        attachment_id: expense.attachmentId ?? null,
                        updated_at: new Date(),
                      });
                    clothingExpenseId = existingExpense.id;
                  } else {
                    // Insert new record
                    const [insertedClothingExpense] = await trx(
                      'approval_clothing_expense',
                    )
                      .insert({
                        approval_id: id,
                        staff_member_id: insertedStaffMember.id,
                        employee_code: staffMember.employeeCode,
                        clothing_file_checked: expense.clothingFileChecked,
                        clothing_amount: expense.clothingAmount,
                        clothing_reason: expense.clothingReason,
                        reporting_date: null, // ไม่ต้องส่ง มาจาก cron + manual save
                        next_claim_date: nextClaimDate,
                        work_end_date: workEndDate, // ไม่ต้องส่ง เอามาจาก step 1
                        increment_id: approval.incrementId,
                        destination_country: destinationCountry ?? null,
                        attachment_id: expense.attachmentId ?? null,
                        created_at: new Date(),
                        updated_at: new Date(),
                      })
                      .returning('id');
                    clothingExpenseId = insertedClothingExpense.id;
                  }
                }
              }
            }
          }
        }
      }

      // After processing all staff members, clean up old clothing expenses
      if (updateDto.staffMembers && Array.isArray(updateDto.staffMembers)) {
        const currentEmployeeCodes = updateDto.staffMembers
          .map((staff) => staff.employeeCode)
          .filter((code) => !(typeof code === 'string' && code.includes('-')));

        // Delete clothing expenses for employee codes that are no longer in the staff members list
        await trx('approval_clothing_expense')
          .where('approval_id', id)
          .whereNotIn('employee_code', currentEmployeeCodes)
          .delete();
      }

      // Process other expenses
      if (updateDto.otherExpenses && Array.isArray(updateDto.otherExpenses)) {
        console.log(
          'Processing other expenses:',
          JSON.stringify(updateDto.otherExpenses, null, 2),
        );
        await trx('approval_other_expense').where('approval_id', id).delete();
        for (const expense of updateDto.otherExpenses) {
          if (expense && typeof expense === 'object') {
            await trx('approval_other_expense').insert({
              approval_id: id,
              type: expense.type,
              amount: expense.amount,
              position: expense.position,
              reason: expense.reason,
              acknowledged: expense.acknowledged,
              created_at: new Date(),
              updated_at: new Date(),
            });
          }
        }
      }

      // Process conditions
      if (updateDto.conditions && Array.isArray(updateDto.conditions)) {
        console.log(
          'Processing conditions:',
          JSON.stringify(updateDto.conditions, null, 2),
        );
        await trx('approval_conditions').where('approval_id', id).delete();
        for (const condition of updateDto.conditions) {
          if (condition && typeof condition === 'object') {
            await trx('approval_conditions').insert({
              approval_id: id,
              text: condition.text,
            });
          }
        }
      }

      // Process budgets
      if (updateDto.budgets && Array.isArray(updateDto.budgets)) {
        await trx('approval_budgets').where('approval_id', id).delete();

        for (const budget of updateDto.budgets) {
          if (budget && typeof budget === 'object') {
            const [insertedBudget] = await trx('approval_budgets')
              .insert({
                approval_id: id,
                budget_type: budget.budget_type,
                item_type: budget.item_type,
                reservation_code: budget.reservation_code,
                department: budget.department,
                budget_code: budget.budget_code,
                attachment_id: budget.attachment_id ?? null,
              })
              .returning('id');
          }
        }
      }

      // Process continuous approval
      if (updateDto.signerName) {
        // get approval continuous status id
        const approvalContinuousStatusId = await this.knexService
          .knex('approval_continuous_status')
          .where('status_code', 'PENDING')
          .select('id')
          .first();
        if (!approvalContinuousStatusId) {
          throw new NotFoundException('Approval continuous status not found');
        }
        const [insertedContinuousApproval] = await trx('approval_continuous')
          .insert({
            approval_id: id,
            employee_code: updateDto.staffEmployeeCode,
            approval_continuous_status_id: approvalContinuousStatusId.id,
            created_by: employeeCode,
            //updated_by: userId,
            signer_name: updateDto.signerName,
            signer_date: updateDto.signerDate,
            document_ending: updateDto.documentEnding,
            document_ending_wording: updateDto.documentEndingWording,
            use_file_signature: updateDto.useFileSignature,
            signature_attachment_id: updateDto.signatureAttachmentId,
            use_system_signature: updateDto.useSystemSignature,
            comments: updateDto.comments,
          })
          .returning('id');
      }

      // Process JSON fields
      const updateData: any = {};

      if (updateDto.departments && Array.isArray(updateDto.departments)) {
        console.log(
          'Processing departments:',
          JSON.stringify(updateDto.departments, null, 2),
        );
        updateData.departments = JSON.stringify(updateDto.departments);
      }

      if (updateDto.degrees && Array.isArray(updateDto.degrees)) {
        console.log(
          'Processing degrees:',
          JSON.stringify(updateDto.degrees, null, 2),
        );
        updateData.degrees = JSON.stringify(updateDto.degrees);
      }

      if (
        updateDto.finalDepartments &&
        Array.isArray(updateDto.finalDepartments)
      ) {
        console.log(
          'Processing final departments:',
          JSON.stringify(updateDto.finalDepartments, null, 2),
        );
        updateData.final_departments = JSON.stringify(
          updateDto.finalDepartments,
        );
      }

      if (updateDto.finalDegrees && Array.isArray(updateDto.finalDegrees)) {
        console.log(
          'Processing final degrees:',
          JSON.stringify(updateDto.finalDegrees, null, 2),
        );
        updateData.final_degrees = JSON.stringify(updateDto.finalDegrees);
      }

      if (Object.keys(updateData).length > 0) {
        await trx('approval').where('id', id).update(updateData);
      }

      // Process main approval attachments (documents)
      if (
        updateDto.documentAttachments &&
        updateDto.documentAttachments.length > 0
      ) {
        await this.attachmentService.updateAttachments(
          'approval_document',
          id,
          updateDto.documentAttachments,
        );
      }

      // Process main approval signature attachments
      if (
        updateDto.signatureAttachments &&
        updateDto.signatureAttachments.length > 0
      ) {
        await this.attachmentService.updateAttachments(
          'approval_signature',
          id,
          updateDto.signatureAttachments,
        );
      }

      // Commit the transaction
      await trx.commit();

      // Process budget attachments after transaction commit
      if (updateDto.budgets && Array.isArray(updateDto.budgets)) {
        for (const budget of updateDto.budgets) {
          if (
            budget &&
            typeof budget === 'object' &&
            budget.attachments &&
            budget.attachments.length > 0
          ) {
            await this.attachmentService.updateAttachments(
              'approval_budgets',
              id,
              budget.attachments,
            );
          }
        }
      }

      // Process clothing expense attachments after transaction commit
      if (updateDto.staffMembers && Array.isArray(updateDto.staffMembers)) {
        for (const staffMember of updateDto.staffMembers) {
          if (
            staffMember.clothingExpenses &&
            Array.isArray(staffMember.clothingExpenses)
          ) {
            for (const expense of staffMember.clothingExpenses) {
              if (
                expense &&
                typeof expense === 'object' &&
                expense.attachments &&
                expense.attachments.length > 0
              ) {
                // ใช้ approval ID แทน clothing expense ID เพื่อให้ entityId ไม่เปลี่ยน
                await this.attachmentService.updateAttachments(
                  'approval_clothing_expense',
                  id,
                  expense.attachments,
                );
              }
            }
          }
        }
      }

      // Process continuous approval signature attachments after transaction commit
      if (
        updateDto.signatureAttachments &&
        updateDto.signatureAttachments.length > 0
      ) {
        // ใช้ approval ID แทน continuous approval ID เพื่อให้ entityId ไม่เปลี่ยน
        await this.attachmentService.updateAttachments(
          'approval_continuous_signature',
          id,
          updateDto.signatureAttachments,
        );
      }

      // Clean up old files after successful update
      // Delete old attachment file if it's different from the new one
      if (
        oldAttachmentId &&
        updateDto.attachmentId &&
        oldAttachmentId !== updateDto.attachmentId
      ) {
        try {
          await this.filesService.remove(oldAttachmentId);
        } catch (error) {
          console.warn(
            `Warning: Failed to delete old attachment file ${oldAttachmentId}:`,
            error.message,
          );
        }
      }

      // Delete old signature attachment file if it's different from the new one
      if (
        oldSignatureAttachmentId &&
        updateDto.signatureAttachmentId &&
        oldSignatureAttachmentId !== updateDto.signatureAttachmentId
      ) {
        try {
          await this.filesService.remove(oldSignatureAttachmentId);
        } catch (error) {
          console.warn(
            `Warning: Failed to delete old signature attachment file ${oldSignatureAttachmentId}:`,
            error.message,
          );
        }
      }

      // Invalidate the cache
      await this.cacheService.del(
        this.cacheService.generateKey(this.CACHE_PREFIX, id),
      );
      await this.cacheService.del(
        this.cacheService.generateListKey(this.CACHE_PREFIX),
      );

      return updatedApprovalRecord;
    } catch (error) {
      // Rollback the transaction in case of error
      await trx.rollback();
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    const approval = await this.findById(id);
    if (!approval) {
      throw new NotFoundException(`Approval with ID ${id} not found`);
    }

    // Store attachment IDs before soft deletion
    const attachmentId = approval.attachmentId;
    const signatureAttachmentId = approval.signatureAttachmentId;

    const result = await this.approvalRepository.softDelete(id);
    if (!result) {
      throw new NotFoundException(`Approval with ID ${id} not found`);
    }

    // Delete associated files after successful soft deletion
    if (attachmentId) {
      try {
        await this.filesService.remove(attachmentId);
      } catch (error) {
        console.warn(
          `Warning: Failed to delete attachment file ${attachmentId}:`,
          error.message,
        );
      }
    }

    if (signatureAttachmentId) {
      try {
        await this.filesService.remove(signatureAttachmentId);
      } catch (error) {
        console.warn(
          `Warning: Failed to delete signature attachment file ${signatureAttachmentId}:`,
          error.message,
        );
      }
    }

    // Delete all attachments from approval_attachments table
    try {
      await this.attachmentService.deleteAttachments('approval_document', id);
      await this.attachmentService.deleteAttachments('approval_signature', id);
      await this.attachmentService.deleteAttachments('approval_budgets', id);
      await this.attachmentService.deleteAttachments(
        'approval_clothing_expense',
        id,
      );
      await this.attachmentService.deleteAttachments(
        'approval_continuous_signature',
        id,
      );
    } catch (error) {
      console.warn(
        `Warning: Failed to delete approval attachments for approval ${id}:`,
        error.message,
      );
    }

    // Remove from cache
    await this.cacheService.del(
      this.cacheService.generateKey(this.CACHE_PREFIX, id),
    );
    // Invalidate the list cache
    await this.cacheService.del(
      this.cacheService.generateListKey(this.CACHE_PREFIX),
    );
  }

  async updateStatus(
    id: number,
    updateStatusDto: UpdateApprovalStatusDto,
    employeeCode: string,
  ): Promise<void> {
    const approval = await this.findById(id);
    if (!approval) {
      throw new NotFoundException(`Approval with ID ${id} not found`);
    }

    // Start a transaction
    const trx = await this.knexService.knex.transaction();

    // get approval status label id
    const approvalStatusLabelId = await this.knexService
      .knex('approval_status_labels')
      .where('status_code', updateStatusDto.status)
      .select('id')
      .first();

    // if approvalStatusLabelId not found, throw error
    if (!approvalStatusLabelId) {
      throw new NotFoundException(
        `Approval status label with status code ${updateStatusDto.status} not found`,
      );
    }

    try {
      // Insert new status record
      await trx('approval_status_history').insert({
        approval_status_label_id: approvalStatusLabelId.id,
        created_by: employeeCode,
        approval_id: id,
        created_at: new Date(),
        updated_at: new Date(),
      });

      // update approval status label id
      await trx('approval').where('id', id).update({
        approval_status_label_id: approvalStatusLabelId.id,
      });

      // Commit the transaction
      await trx.commit();

      // Invalidate the cache
      await this.cacheService.del(
        this.cacheService.generateKey(this.CACHE_PREFIX, id),
      );
      await this.cacheService.del(
        this.cacheService.generateListKey(this.CACHE_PREFIX),
      );
    } catch (error) {
      // Rollback the transaction in case of error
      await trx.rollback();
      throw error;
    }
  }

  async updateClothingExpenseDates(
    id: number,
    updateDatesDto: UpdateClothingExpenseDatesDto,
  ): Promise<void> {
    const approval = await this.findById(id);
    if (!approval) {
      throw new NotFoundException(`Approval with ID ${id} not found`);
    }

    // Start a transaction
    const trx = await this.knexService.knex.transaction();

    try {
      // Update clothing expense dates
      await trx('approval_clothing_expense').where('approval_id', id).update({
        reporting_date: updateDatesDto.reportingDate,
        next_claim_date: updateDatesDto.nextClaimDate,
        ddwork_end_date: updateDatesDto.ddworkEndDate,
        updated_at: new Date(),
      });

      // Commit the transaction
      await trx.commit();

      // Invalidate the cache
      await this.cacheService.del(
        this.cacheService.generateKey(this.CACHE_PREFIX, id),
      );
      await this.cacheService.del(
        this.cacheService.generateListKey(this.CACHE_PREFIX),
      );
    } catch (error) {
      // Rollback the transaction in case of error
      await trx.rollback();
      throw error;
    }
  }

  async checkClothingExpenseEligibility(
    checkEligibilityDto: CheckClothingExpenseEligibilityDto,
  ): Promise<ClothingExpenseEligibilityResponseDto[]> {
    const employeeCodes = checkEligibilityDto.employees.map(
      (emp) => emp.employeeCode,
    );

    // set default result isEligible false
    const result = employeeCodes.map((employeeCode) => ({
      employeeCode,
      isEligible: false,
    }));

    if (
      !['international', 'temporary-international'].includes(
        checkEligibilityDto.travelType,
      )
    ) {
      // return all employee codes with isEligible false
      return result;
    }

    if (checkEligibilityDto.travelType === 'international') {
      await this.processInternationalEligibility(checkEligibilityDto, result);
    } else if (checkEligibilityDto.travelType === 'temporary-international') {
      await this.processTemporaryInternationalEligibility(
        checkEligibilityDto,
        result,
      );
    } else {
      // ถ้าเป็นประเภทอื่นๆ, set isEligible false
      result.forEach((r) => (r.isEligible = false));
    }

    return result;
  }

  private async processInternationalEligibility(
    checkEligibilityDto: CheckClothingExpenseEligibilityDto,
    result: ClothingExpenseEligibilityResponseDto[],
  ): Promise<void> {
    for (const employeeCode of result.map((r) => r.employeeCode)) {
      const pwJob = await this.getPwJob(employeeCode);

      // ถ้าไม่เจอข้อมูลการเบิกล่าสุด, set isEligible true
      if (!pwJob) {
        this.updateEligibility(result, employeeCode, true);
      } else {
        await this.processPwJobForInternational(
          pwJob,
          checkEligibilityDto,
          result,
          employeeCode,
        );
      }
    }
  }

  private async processTemporaryInternationalEligibility(
    checkEligibilityDto: CheckClothingExpenseEligibilityDto,
    result: ClothingExpenseEligibilityResponseDto[],
  ): Promise<void> {
    for (const employeeCode of result.map((r) => r.employeeCode)) {
      const pwJob = await this.getPwJob(employeeCode);

      // ถ้าไม่เจอข้อมูลการเบิกล่าสุด, set isEligible true
      if (!pwJob) {
        this.updateEligibility(result, employeeCode, true);
      } else {
        await this.processPwJobForTemporaryInternational(
          pwJob,
          checkEligibilityDto,
          result,
          employeeCode,
        );
      }
    }
  }

  private async getPwJob(employeeCode: string | number) {
    if (typeof employeeCode === 'string' && employeeCode.includes('-')) {
      return null;
    }

    return await this.knexService
      .knex('PS_PW_JOB')
      .where('EMPLID', employeeCode)
      .andWhere('ACTION', 'XFR')
      .andWhere('ACTION_REASON', '008')
      .orderBy('EFFDT', 'desc')
      .first();
  }

  private async processPwJobForInternational(
    pwJob: any,
    checkEligibilityDto: CheckClothingExpenseEligibilityDto,
    result: ClothingExpenseEligibilityResponseDto[],
    employeeCode: number,
  ): Promise<void> {
    // เอา pwJob.DEPTID ไปเช็ค table OP_ORGANIZE_R_TEMP ว่าเป็นหน่วยงานต่างประเทศไหม
    const organize = await this.knexService
      .knex('OP_ORGANIZE_R')
      .where('POG_CODE', pwJob.DEPTID)
      .first();

    if (organize.POG_TYPE == 3) {
      // POG_TYPE 2 = ในประเทศ / 3 = ต่างประเทศ
      // ถ้าเป็นหน่วยงานต่างประเทศ
      // เอา organize.POG_CODE ไปเช็ค table office_international ว่าเป็นสำนักงาน นั้นเป็น ประเภทไหน

      // หา ประเภท A B C ของ office internatinal จากใบเก่า
      const oldDestination = await this.knexService
        .knex('office_international')
        .where('pog_code', organize.POG_CODE)
        .join('countries', 'office_international.country_id', 'countries.id')
        .first();

      // หา ประเภท A B C ของ current destination employee
      const destination = checkEligibilityDto.employees.find(
        (emp) => emp.employeeCode === employeeCode,
      );
      let currentDestination;
      if (destination.destinationTable === 'countries') {
        currentDestination = await this.knexService
          .knex('countries')
          .where('id', destination.destinationId)
          .first();
      } else if (destination.destinationTable === 'tatOffices') {
        currentDestination = await this.knexService
          .knex('office_international')
          .where('office_international.id', destination.destinationId)
          .join('countries', 'office_international.country_id', 'countries.id')
          .first();
      }

      if (currentDestination && oldDestination) {
        // ถ้าเป็นประเภท A B C ของ ใบเก่า และ ใบใหม่ ไม่เหมือนกัน, set isEligible true
        if (currentDestination.type !== oldDestination.type) {
          this.updateEligibility(result, employeeCode, true);
        } else {
          // ถ้าประเภทเหมือนกัน
          // ให้เอา EFFDT จาก pwJob มาเช็คกับ checkEligibilityDto.workStartDate ว่าเกิน 2 ปี หรือยัง ถ้าเกินแล้ว, set isEligible true
          // @todo อาจต้องเปลี่ยนไปเช็ค วันรายงานตัวกับ ViewDutyformCommands (รอคอนเฟิม)
          const isOverTwoYears = this.isOverTwoYears(
            pwJob.EFFDT,
            checkEligibilityDto.workStartDate,
          );
          this.updateEligibility(result, employeeCode, isOverTwoYears);
        }
      } else {
        this.updateEligibility(result, employeeCode, true);
      }
    } else {
      // @todo ถ้าเป็น type อื่นๆ
      this.updateEligibility(result, employeeCode, true);
    }
  }

  private async processPwJobForTemporaryInternational(
    pwJob: any,
    checkEligibilityDto: CheckClothingExpenseEligibilityDto,
    result: ClothingExpenseEligibilityResponseDto[],
    employeeCode: number,
  ): Promise<void> {
    // @todo ต้องเช็คว่า ครั้งก่อนเบิกประเภทไหน
    if (true) {
      // ex ครั้งก่อนเป็นประจำ, set isEligible true
      this.updateEligibility(result, employeeCode, true);
    } else {
      // ex ครั้งก่อนเป็นชั่วคราว
      // ให้เอา EFFDT จาก pwJob มาเช็คกับ checkEligibilityDto.workStartDate ว่าเกิน 2 ปี หรือยัง ถ้าเกินแล้ว, set isEligible true
      // @todo อาจต้องเปลี่ยนไปเช็ค วันรายงานตัวกับ ViewDutyformCommands (รอคอนเฟิม)
      const isOverTwoYears = this.isOverTwoYears(
        pwJob.EFFDT,
        checkEligibilityDto.workStartDate,
      );
      this.updateEligibility(result, employeeCode, isOverTwoYears);
    }
  }

  private isOverTwoYears(effdt: string, workStartDate: string): boolean {
    const effdtDate = new Date(effdt);
    const workStartDateObj = new Date(workStartDate);
    const diffTime = Math.abs(effdtDate.getTime() - workStartDateObj.getTime());
    const diffYears = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 365));
    return diffYears > 2;
  }

  private updateEligibility(
    result: ClothingExpenseEligibilityResponseDto[],
    employeeCode: number,
    isEligible: boolean,
  ): void {
    const employeeResult = result.find((r) => r.employeeCode === employeeCode);
    if (employeeResult) {
      employeeResult.isEligible = isEligible;
    }
  }

  private calculateNextClaimDate(workStartDate: string): string {
    //  next_cliam_date = (workSartDate s  + 2 ปี + 1 วัน )
    const workStartDateObj = new Date(workStartDate);
    const nextClaimDate = new Date(
      workStartDateObj.getTime() +
        2 * 365 * 24 * 60 * 60 * 1000 +
        24 * 60 * 60 * 1000,
    );
    return nextClaimDate.toISOString().split('T')[0];
  }

  // Approval Status Label methods
  async findAllStatusLabels(): Promise<ApprovalStatusLabel[]> {
    const cacheKey = `${this.CACHE_PREFIX}:status_labels`;

    // Try to get from cache first
    const cached = await this.cacheService.get<string>(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // If not in cache, get from database
    const statusLabels = await this.knexService
      .knex('approval_status_labels')
      .orderBy('id', 'asc')
      .select('*');

    // Transform to camelCase
    const transformedLabels = statusLabels.map((label) => ({
      id: label.id,
      statusCode: label.status_code,
      label: label.label,
      createdAt: label.created_at,
      updatedAt: label.updated_at,
    }));

    // Cache the result
    await this.cacheService.set(
      cacheKey,
      JSON.stringify(transformedLabels),
      this.CACHE_TTL,
    );

    return transformedLabels;
  }

  async findStatusLabelById(
    id: number,
  ): Promise<ApprovalStatusLabel | undefined> {
    const statusLabel = await this.knexService
      .knex('approval_status_labels')
      .where('id', id)
      .first();

    if (!statusLabel) {
      return undefined;
    }

    return {
      id: statusLabel.id,
      statusCode: statusLabel.status_code,
      label: statusLabel.label,
      createdAt: statusLabel.created_at,
      updatedAt: statusLabel.updated_at,
    };
  }

  async findStatusLabelByStatusCode(
    statusCode: string,
  ): Promise<ApprovalStatusLabel | undefined> {
    const statusLabel = await this.knexService
      .knex('approval_status_labels')
      .where('status_code', statusCode)
      .first();

    if (!statusLabel) {
      return undefined;
    }

    return {
      id: statusLabel.id,
      statusCode: statusLabel.status_code,
      label: statusLabel.label,
      createdAt: statusLabel.created_at,
      updatedAt: statusLabel.updated_at,
    };
  }

  async getStatistics(employeeCode: string): Promise<ApprovalStatisticsResponseDto> {
    const cacheKey = `${this.CACHE_PREFIX}:statistics:${employeeCode}`;
    const CACHE_TTL = 300; // 5 minutes

    // Try to get from cache first
    const cached = await this.cacheService.get<string>(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    try {
      // Define interface for raw statistics result
      interface RawStatResult {
        status_code: string;
        travel_type: string;
        count: string;
      }

      // Get all approvals first to process manually (temporary solution)
      const allApprovals = await this.knexService
        .knex('approval')
        .where('approval.created_employee_code', employeeCode)
        .whereNull('approval.deleted_at')
        .select(
          'approval.travel_type',
          'approval.approval_status_label_id',
          'approval.id',
        );

      // Get status labels separately
      const statusLabels = await this.knexService
        .knex('approval_status_labels')
        .select('id', 'status_code');

      // Create a map for quick lookup
      const statusMap = new Map(statusLabels.map((s) => [s.id, s.status_code]));

      // Process data manually to create statistics
      const statsMap = new Map<string, number>();

      allApprovals.forEach((approval) => {
        const statusCode =
          statusMap.get(approval.approval_status_label_id) || 'UNKNOWN';
        const travelType = approval.travel_type || 'unknown';
        const key = `${statusCode}|${travelType}`;

        statsMap.set(key, (statsMap.get(key) || 0) + 1);
      });

      // Convert map to array format expected by the rest of the code
      const rawStats: RawStatResult[] = Array.from(statsMap.entries()).map(
        ([key, count]) => {
          const [status_code, travel_type] = key.split('|');
          return {
            status_code,
            travel_type,
            count: count.toString(),
          };
        },
      );

      // Initialize the structure with all required travel types
      const initTravelTypeBreakdown = (): TravelTypeBreakdownDto => ({
        'temporary-domestic': 0,
        'temporary-international': 0,
        'temporary-both': 0,
        domestic: 0,
        international: 0,
        'training-domestic': 0,
        'training-international': 0,
        unknown: 0,
      });

      const initStatusBreakdown = (): StatusBreakdownDto => ({
        total: 0,
        byTravelType: initTravelTypeBreakdown(),
      });

      // Initialize breakdown structure
      const breakdown: BreakdownDto = {
        draft: initStatusBreakdown(),
        pending: initStatusBreakdown(),
        approved: initStatusBreakdown(),
        rejected: initStatusBreakdown(),
      };

      const summary: SummaryDto = {
        total: 0,
        draft: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
      };

      // Process raw statistics
      rawStats.forEach((stat) => {
        const statusCode = stat.status_code?.toLowerCase() || 'unknown';
        const travelType = stat.travel_type || 'unknown';
        const count = parseInt(stat.count) || 0;

        // Map status codes to breakdown keys
        let statusKey: keyof BreakdownDto;
        switch (statusCode) {
          case 'draft':
            statusKey = 'draft';
            summary.draft += count;
            break;
          case 'pending':
            statusKey = 'pending';
            summary.pending += count;
            break;
          case 'approved':
            statusKey = 'approved';
            summary.approved += count;
            break;
          case 'rejected':
            statusKey = 'rejected';
            summary.rejected += count;
            break;
          default:
            // If unknown status, treat as draft
            statusKey = 'draft';
            summary.draft += count;
        }

        // Map travel types
        let travelTypeKey: keyof TravelTypeBreakdownDto;
        switch (travelType) {
          case 'temporary-domestic':
          case 'temporary-international':
          case 'temporary-both':
          case 'domestic':
          case 'international':
          case 'training-domestic':
          case 'training-international':
            travelTypeKey = travelType as keyof TravelTypeBreakdownDto;
            break;
          default:
            travelTypeKey = 'unknown';
        }

        // Update breakdown
        breakdown[statusKey].total += count;
        breakdown[statusKey].byTravelType[travelTypeKey] += count;
        summary.total += count;
      });

      const response: ApprovalStatisticsResponseDto = {
        success: true,
        data: {
          summary,
          breakdown,
        },
      };

      // Cache the result
      await this.cacheService.set(
        cacheKey,
        JSON.stringify(response),
        CACHE_TTL,
      );

      return response;
    } catch (error) {
      console.error('Error getting approval statistics:', error);
      throw new Error('Failed to retrieve approval statistics');
    }
  }

  private async cleanupOldBudgetFiles(
    oldAttachmentIds: number[],
    newBudgets: any[],
  ): Promise<void> {
    // Get new attachment IDs from the updated budgets
    const newAttachmentIds = newBudgets
      .filter((budget) => budget && budget.attachment_id)
      .map((budget) => budget.attachment_id);

    // Find attachment IDs that are no longer used
    const attachmentsToDelete = oldAttachmentIds.filter(
      (oldId) => !newAttachmentIds.includes(oldId),
    );

    // Delete old files that are no longer referenced
    for (const attachmentId of attachmentsToDelete) {
      try {
        await this.filesService.remove(attachmentId);
        console.log(
          `Successfully deleted old budget attachment file: ${attachmentId}`,
        );
      } catch (error) {
        console.warn(
          `Warning: Failed to delete old budget attachment file ${attachmentId}:`,
          error.message,
        );
      }
    }
  }

  private async cleanupBudgetFilesAfterTransaction(
    fileIds: number[],
  ): Promise<void> {
    // Delete old files that are no longer referenced
    for (const fileId of fileIds) {
      try {
        await this.filesService.remove(fileId);
        console.log(
          `Successfully deleted unused budget attachment file: ${fileId}`,
        );
      } catch (error) {
        console.warn(
          `Warning: Failed to delete unused budget attachment file ${fileId}:`,
          error.message,
        );
      }
    }
  }

  async updateApprovalContinuous(
    id: number,
    updateDto: UpdateApprovalContinuousDto,
    employeeCode: string,
  ): Promise<void> {
    // Check if approval_continuous exists and has PENDING status
    const existingContinuous = await this.knexService
      .knex('approval_continuous as ac')
      .leftJoin(
        'approval_continuous_status as acs',
        'ac.approval_continuous_status_id',
        'acs.id',
      )
      .where('ac.id', id)
      .select('ac.*', 'acs.status_code as statusCode')
      .first();

    if (!existingContinuous) {
      throw new NotFoundException(
        `Approval continuous with ID ${id} not found`,
      );
    }

    if (existingContinuous.statusCode !== 'PENDING') {
      throw new NotFoundException(
        `Approval continuous with ID ${id} cannot be updated. Only PENDING status can be updated.`,
      );
    }

    // Start a transaction
    const trx = await this.knexService.knex.transaction();

    try {
      const updateData: any = {};

      // Update status if provided
      if (updateDto.statusCode) {
        const approvalContinuousStatusId = await this.knexService
          .knex('approval_continuous_status')
          .where('status_code', updateDto.statusCode)
          .select('id')
          .first();

        if (!approvalContinuousStatusId) {
          throw new NotFoundException(
            `Approval continuous status with code ${updateDto.statusCode} not found`,
          );
        }

        updateData.approval_continuous_status_id =
          approvalContinuousStatusId.id;
      }

      // get approval_continuous_status_id of PENDING
      const approvalContinuousStatusIdPending = await this.knexService
        .knex('approval_continuous_status')
        .where('status_code', 'PENDING')
        .select('id')
        .first();

      if (updateDto.statusCode === 'APPROVED') {
        // Add updated_by and updated_at
        updateData.updated_by = employeeCode;
        updateData.updated_at = new Date();

        // Update the record
        await trx('approval_continuous').where('id', id).update(updateData);

        // update approval.continuous_employee_code
        await trx('approval')
          .where('id', existingContinuous.approval_id)
          .update({
            continuous_employee_code: updateDto.employeeCode,
          });

        // get approval.final_staff_employee_code
        const approval = await trx('approval')
          .where('id', existingContinuous.approval_id)
          .select('final_staff_employee_code')
          .first();

        // if current employee code is final_staff_employee_code, update approval status to APPROVED
        if (
          existingContinuous.employee_code ===
          approval.final_staff_employee_code
        ) {
          // get approval_status_label_id of APPROVED
          const approvalStatusLabelIdApproved = await trx(
            'approval_status_labels',
          )
            .where('status_code', 'APPROVED')
            .select('id')
            .first();

          // update approval status to APPROVED
          await trx('approval')
            .where('id', existingContinuous.approval_id)
            .update({
              approval_status_label_id: approvalStatusLabelIdApproved.id,
            });

          // insert approval_status_history
          await trx('approval_status_history').insert({
            approval_status_label_id: approvalStatusLabelIdApproved.id,
            created_by: employeeCode,
            approval_id: existingContinuous.approval_id,
            created_at: new Date(),
            updated_at: new Date(),
          });
        } else {
          // insert approval_continuous // employee คนถัดไป
          await trx('approval_continuous').insert({
            approval_id: existingContinuous.approval_id,
            employee_code: updateDto.employeeCode,
            signer_name: updateDto.signerName,
            signer_date: updateDto.signerDate,
            use_file_signature: updateDto.useFileSignature,
            signature_attachment_id: updateDto.signatureAttachmentId,
            use_system_signature: updateDto.useSystemSignature,
            comments: updateDto.comments,
            approval_continuous_status_id: approvalContinuousStatusIdPending.id,
            created_by: employeeCode,
          });
        }
      } else if (updateDto.statusCode === 'REJECTED') {
        // Add updated_by and updated_at
        updateData.updated_by = employeeCode;
        updateData.updated_at = new Date();

        // update the status of approval_continuous
        await trx('approval_continuous').where('id', id).update(updateData);

        // get approval_status_label_id of REJECTED
        const approvalStatusLabelIdRejected = await trx(
          'approval_status_labels',
        )
          .where('status_code', 'REJECTED')
          .select('id')
          .first();

        // update approval status to REJECTED
        await trx('approval')
          .where('id', existingContinuous.approval_id)
          .update({
            approval_status_label_id: approvalStatusLabelIdRejected.id,
          });

        // insert approval_status_history for REJECTED
        await trx('approval_status_history').insert({
          approval_status_label_id: approvalStatusLabelIdRejected.id,
          created_by: employeeCode,
          approval_id: existingContinuous.approval_id,
          created_at: new Date(),
          updated_at: new Date(),
        });

        // get the approval creator (employee_code from approval table)
        const approval = await trx('approval')
          .where('id', existingContinuous.approval_id)
          .select('employee_code')
          .first();

        // update approval.continuous_employee_code กลับไปผู้สร้าง
        await trx('approval')
          .where('id', existingContinuous.approval_id)
          .update({
            continuous_employee_code: approval.employee_code,
          });

        // insert approval_continuous // ส่งกลับไปผู้สร้าง
        await trx('approval_continuous').insert({
          approval_id: existingContinuous.approval_id,
          employee_code: approval.employee_code,
          signer_name: updateDto.signerName,
          signer_date: updateDto.signerDate,
          use_file_signature: updateDto.useFileSignature,
          signature_attachment_id: updateDto.signatureAttachmentId,
          use_system_signature: updateDto.useSystemSignature,
          comments: updateDto.comments,
          approval_continuous_status_id: approvalContinuousStatusIdPending.id,
          created_by: employeeCode,
        });
      }

      // Commit the transaction
      await trx.commit();

      // Invalidate the cache for the related approval
      await this.cacheService.del(
        this.cacheService.generateKey(
          this.CACHE_PREFIX,
          existingContinuous.approval_id,
        ),
      );
      await this.cacheService.del(
        this.cacheService.generateListKey(this.CACHE_PREFIX),
      );
    } catch (error) {
      // Rollback the transaction in case of error
      await trx.rollback();
      throw error;
    }
  }

  async duplicate(
    id: number, 
    employeeCode: string, 
    employeeName: string
  ): Promise<Approval> {
    // Get the original approval
    const originalApproval = await this.findById(id);
    if (!originalApproval) {
      throw new NotFoundException(`Approval with ID ${id} not found`);
    }

    // Start a transaction
    const trx = await this.knexService.knex.transaction();

    try {
      // Generate new increment ID and print numbers
      const incrementId = await this.generateIncrementId();
      const approvalPrintNumber = await this.generateApprovalPrintNumber();
      const expensePrintNumber = await this.generateApprovalPrintNumber();

      // Get the approval status label ID for DRAFT
      const approvalStatusLabelId = await this.knexService
        .knex('approval_status_labels')
        .where('status_code', 'DRAFT')
        .select('id')
        .first();

      // Create new approval record with copied data
      const newApprovalData = {
        increment_id: incrementId,
        record_type: originalApproval.recordType,
        name: originalApproval.name,
        employee_code: originalApproval.employeeCode,
        travel_type: originalApproval.travelType,
        international_sub_option: originalApproval.internationalSubOption,
        approval_ref: originalApproval.id,
        work_start_date: originalApproval.workStartDate,
        work_end_date: originalApproval.workEndDate,
        start_country: originalApproval.startCountry,
        end_country: originalApproval.endCountry,
        remarks: originalApproval.remarks,
        num_travelers: originalApproval.numTravelers,
        document_no: originalApproval.documentNo,
        document_tel: originalApproval.documentTel,
        document_to: originalApproval.documentTo,
        document_title: originalApproval.documentTitle,
        attachment_id: originalApproval.attachmentId,
        form3_total_outbound: originalApproval.form3TotalOutbound,
        form3_total_inbound: originalApproval.form3TotalInbound,
        form3_total_amount: originalApproval.form3TotalAmount,
        exceed_lodging_rights_checked:
          originalApproval.exceedLodgingRightsChecked,
        exceed_lodging_rights_reason:
          originalApproval.exceedLodgingRightsReason,
        form4_total_amount: originalApproval.form4TotalAmount,
        form5_total_amount: originalApproval.form5TotalAmount,
        approval_date: originalApproval.approvalDate,
        staff: originalApproval.staff,
        staff_employee_code: originalApproval.staffEmployeeCode,
        final_staff_employee_code: originalApproval.finalStaffEmployeeCode,
        confidentiality_level: originalApproval.confidentialityLevel,
        urgency_level: originalApproval.urgencyLevel,
        comments: originalApproval.comments,
        final_staff: originalApproval.finalStaff,
        signer_date: originalApproval.signerDate,
        document_ending: originalApproval.documentEnding,
        document_ending_wording: originalApproval.documentEndingWording,
        signer_name: originalApproval.signerName,
        use_file_signature: originalApproval.useFileSignature,
        signature_attachment_id: originalApproval.signatureAttachmentId,
        use_system_signature: originalApproval.useSystemSignature,
        approval_print_number: approvalPrintNumber,
        expense_print_number: expensePrintNumber,
        created_employee_code: employeeCode,
        created_employee_name: employeeName,
        //user_id: userId,
        approval_status_label_id: approvalStatusLabelId.id,
        continuous_employee_code: originalApproval.continuousEmployeeCode,
        created_at: new Date(),
        updated_at: new Date(),
      };

      // Insert the new approval
      const [newApproval] = await trx('approval')
        .insert(newApprovalData)
        .returning('*');

      // Create the approval status history record
      await trx('approval_status_history').insert({
        approval_status_label_id: approvalStatusLabelId.id,
        created_by: employeeCode,
        approval_id: newApproval.id,
        created_at: new Date(),
        updated_at: new Date(),
      });

      // Copy travel date ranges
      if (
        originalApproval.travelDateRanges &&
        originalApproval.travelDateRanges.length > 0
      ) {
        for (const dateRange of originalApproval.travelDateRanges as any) {
          await trx('approval_date_ranges').insert({
            approval_id: newApproval.id,
            start_date: dateRange.startDate,
            end_date: dateRange.endDate,
          });
        }
      }

      // Copy approval contents
      if (
        originalApproval.approvalContents &&
        originalApproval.approvalContents.length > 0
      ) {
        for (const content of originalApproval.approvalContents) {
          await trx('approval_contents').insert({
            approval_id: newApproval.id,
            detail: content.detail,
          });
        }
      }

      // Copy trip entries and their date ranges
      if (
        originalApproval.tripEntries &&
        originalApproval.tripEntries.length > 0
      ) {
        for (const tripEntry of originalApproval.tripEntries) {
          const [newTripEntry] = await trx('approval_trip_entries')
            .insert({
              approval_id: newApproval.id,
              location: tripEntry.location,
              destination: tripEntry.destination,
              nearby_provinces: tripEntry.nearbyProvinces,
              details: tripEntry.details,
              destination_type: tripEntry.destinationType,
              destination_id: tripEntry.destinationId,
              destination_table: tripEntry.destinationTable,
            })
            .returning('id');

          // Copy trip date ranges
          if (tripEntry.tripDateRanges && tripEntry.tripDateRanges.length > 0) {
            for (const dateRange of tripEntry.tripDateRanges as any) {
              await trx('approval_trip_date_ranges').insert({
                approval_id: newApproval.id,
                approval_trip_entries_id: newTripEntry.id,
                start_date: dateRange.startDate,
                end_date: dateRange.endDate,
              });
            }
          }
        }
      }

      // Copy staff members and their related data
      if (
        originalApproval.staffMembers &&
        originalApproval.staffMembers.length > 0
      ) {
        for (const staffMember of originalApproval.staffMembers) {
          const [newStaffMember] = await trx('approval_staff_members')
            .insert({
              approval_id: newApproval.id,
              employee_code: staffMember.employeeCode,
              type: staffMember.type,
              name: staffMember.name,
              role: staffMember.role,
              position: staffMember.position,
              right_equivalent: staffMember.rightEquivalent,
              organization_position: staffMember.organizationPosition,
              created_at: new Date(),
              updated_at: new Date(),
            })
            .returning('id');

          // Copy work locations and their related data
          if (
            staffMember.workLocations &&
            staffMember.workLocations.length > 0
          ) {
            for (const workLocation of staffMember.workLocations) {
              const [newWorkLocation] = await trx('approval_work_locations')
                .insert({
                  approval_id: newApproval.id,
                  staff_member_id: newStaffMember.id,
                  location: workLocation.location,
                  destination: workLocation.destination,
                  nearby_provinces: workLocation.nearbyProvinces,
                  details: workLocation.details,
                  checked: workLocation.checked,
                  destination_type: workLocation.destinationType,
                  destination_id: workLocation.destinationId,
                  destination_table: workLocation.destinationTable,
                  created_at: new Date(),
                  updated_at: new Date(),
                })
                .returning('id');

              // Copy work location date ranges
              if (
                workLocation.tripDateRanges &&
                workLocation.tripDateRanges.length > 0
              ) {
                for (const dateRange of workLocation.tripDateRanges as any) {
                  await trx('approval_work_locations_date_ranges').insert({
                    approval_id: newApproval.id,
                    approval_work_locations_id: newWorkLocation.id,
                    start_date: dateRange.startDate,
                    end_date: dateRange.endDate,
                    created_at: new Date(),
                    updated_at: new Date(),
                  });
                }
              }

              // Copy transportation expenses
              if (
                workLocation.transportationExpenses &&
                workLocation.transportationExpenses.length > 0
              ) {
                for (const expense of workLocation.transportationExpenses) {
                  const expenseData = expense as any;
                  await trx('approval_transportation_expense').insert({
                    approval_id: newApproval.id,
                    staff_member_id: newStaffMember.id,
                    work_location_id: newWorkLocation.id,
                    travel_type: expense.travelType,
                    expense_type: expense.expenseType,
                    travel_method: expense.travelMethod,
                    outbound_origin: expenseData.outboundOrigin,
                    outbound_destination: expenseData.outboundDestination,
                    outbound_trips: expenseData.outboundTrips,
                    outbound_expense: expenseData.outboundExpense,
                    outbound_total: expenseData.outboundTotal,
                    inbound_origin: expenseData.inboundOrigin,
                    inbound_destination: expenseData.inboundDestination,
                    inbound_trips: expenseData.inboundTrips,
                    inbound_expense: expenseData.inboundExpense,
                    inbound_total: expenseData.inboundTotal,
                    total_amount: expense.totalAmount,
                    created_at: new Date(),
                    updated_at: new Date(),
                  });
                }
              }

              // Copy accommodation expenses
              if (
                workLocation.accommodationExpenses &&
                workLocation.accommodationExpenses.length > 0
              ) {
                for (const expense of workLocation.accommodationExpenses) {
                  const [newAccommodationExpense] = await trx(
                    'approval_accommodation_expense',
                  )
                    .insert({
                      approval_id: newApproval.id,
                      staff_member_id: newStaffMember.id,
                      work_location_id: newWorkLocation.id,
                      total_amount: expense.totalAmount,
                      has_meal_out: expense.hasMealOut,
                      has_meal_in: expense.hasMealIn,
                      meal_out_amount: expense.mealOutAmount,
                      meal_in_amount: expense.mealInAmount,
                      meal_out_count: expense.mealOutCount,
                      meal_in_count: expense.mealInCount,
                      allowance_out_checked: expense.allowanceOutChecked,
                      allowance_out_rate: expense.allowanceOutRate,
                      allowance_out_days: expense.allowanceOutDays,
                      allowance_out_total: expense.allowanceOutTotal,
                      allowance_in_checked: expense.allowanceInChecked,
                      allowance_in_rate: expense.allowanceInRate,
                      allowance_in_days: expense.allowanceInDays,
                      allowance_in_total: expense.allowanceInTotal,
                      lodging_fixed_checked: expense.lodgingFixedChecked,
                      lodging_double_checked: expense.lodgingDoubleChecked,
                      lodging_single_checked: expense.lodgingSingleChecked,
                      lodging_nights: expense.lodgingNights,
                      lodging_rate: expense.lodgingRate,
                      lodging_double_nights: expense.lodgingDoubleNights,
                      lodging_double_rate: expense.lodgingDoubleRate,
                      lodging_single_nights: expense.lodgingSingleNights,
                      lodging_single_rate: expense.lodgingSingleRate,
                      lodging_double_person: expense.lodgingDoublePerson,
                      lodging_double_person_external:
                        expense.lodgingDoublePersonExternal,
                      lodging_total: expense.lodgingTotal,
                      moving_cost_checked: expense.movingCostChecked,
                      moving_cost_rate: expense.movingCostRate,
                      created_at: new Date(),
                      updated_at: new Date(),
                    })
                    .returning('id');

                  // Copy accommodation transport expenses
                  if (
                    expense.accommodationTransportExpenses &&
                    expense.accommodationTransportExpenses.length > 0
                  ) {
                    for (const transportExpense of expense.accommodationTransportExpenses) {
                      await trx(
                        'approval_accommodation_transport_expense',
                      ).insert({
                        approval_id: newApproval.id,
                        approval_accommodation_expense_id:
                          newAccommodationExpense.id,
                        type: transportExpense.type,
                        amount: transportExpense.amount,
                        checked: transportExpense.checked,
                        flight_route: transportExpense.flightRoute,
                        created_at: new Date(),
                        updated_at: new Date(),
                      });
                    }
                  }

                  // Copy accommodation holiday expenses
                  const expenseWithHoliday = expense as any;
                  if (
                    expenseWithHoliday.accommodationHolidayExpenses &&
                    expenseWithHoliday.accommodationHolidayExpenses.length > 0
                  ) {
                    for (const holidayExpense of expenseWithHoliday.accommodationHolidayExpenses) {
                      await trx(
                        'approval_accommodation_holiday_expense',
                      ).insert({
                        approval_id: newApproval.id,
                        approval_accommodation_expense_id:
                          newAccommodationExpense.id,
                        date: holidayExpense.date,
                        thai_date: holidayExpense.thaiDate,
                        checked: holidayExpense.checked,
                        time: holidayExpense.time,
                        hours: holidayExpense.hours,
                        total: holidayExpense.total,
                        note: holidayExpense.note,
                        created_at: new Date(),
                        updated_at: new Date(),
                      });
                    }
                  }
                }
              }
            }
          }

          // Copy entertainment expenses
          if (
            staffMember.entertainmentExpenses &&
            staffMember.entertainmentExpenses.length > 0
          ) {
            for (const expense of staffMember.entertainmentExpenses) {
              await trx('approval_entertainment_expense').insert({
                approval_id: newApproval.id,
                staff_member_id: newStaffMember.id,
                entertainment_short_checked: expense.entertainmentShortChecked,
                entertainment_long_checked: expense.entertainmentLongChecked,
                entertainment_amount: expense.entertainmentAmount,
                created_at: new Date(),
                updated_at: new Date(),
              });
            }
          }

          // Copy clothing expenses
          if (
            staffMember.clothingExpenses &&
            staffMember.clothingExpenses.length > 0
          ) {
            if (
              typeof staffMember.employeeCode === 'string' &&
              staffMember.employeeCode.includes('-')
            ) {
              continue;
            }

            for (const expense of staffMember.clothingExpenses) {
              await trx('approval_clothing_expense').insert({
                approval_id: newApproval.id,
                staff_member_id: newStaffMember.id,
                employee_code: staffMember.employeeCode,
                clothing_file_checked: expense.clothingFileChecked,
                clothing_amount: expense.clothingAmount,
                clothing_reason: expense.clothingReason,
                reporting_date: expense.reportingDate,
                next_claim_date: expense.nextClaimDate,
                work_end_date: expense.workEndDate,
                increment_id: newApproval.increment_id,
                destination_country: expense.destinationCountry,
                attachment_id: expense.attachmentId,
                created_at: new Date(),
                updated_at: new Date(),
              });
            }
          }
        }
      }

      // Copy other expenses
      if (
        originalApproval.otherExpenses &&
        originalApproval.otherExpenses.length > 0
      ) {
        for (const expense of originalApproval.otherExpenses) {
          await trx('approval_other_expense').insert({
            approval_id: newApproval.id,
            type: expense.type,
            amount: expense.amount,
            position: expense.position,
            reason: expense.reason,
            acknowledged: expense.acknowledged,
            created_at: new Date(),
            updated_at: new Date(),
          });
        }
      }

      // Copy conditions
      if (
        originalApproval.conditions &&
        originalApproval.conditions.length > 0
      ) {
        for (const condition of originalApproval.conditions) {
          await trx('approval_conditions').insert({
            approval_id: newApproval.id,
            text: condition.text,
          });
        }
      }

      // Copy budgets
      if (originalApproval.budgets && originalApproval.budgets.length > 0) {
        for (const budget of originalApproval.budgets as any) {
          await trx('approval_budgets').insert({
            approval_id: newApproval.id,
            budget_type: budget.budgetType,
            item_type: budget.itemType,
            reservation_code: budget.reservationCode,
            department: budget.department,
            budget_code: budget.budgetCode,
            attachment_id: budget.budgetAttachmentId,
          });
        }
      }

      // Commit the transaction
      await trx.commit();

      // Cache the new approval
      await this.cacheService.set(
        this.cacheService.generateKey(this.CACHE_PREFIX, newApproval.id),
        newApproval,
        this.CACHE_TTL,
      );

      // Invalidate the list cache
      await this.cacheService.del(
        this.cacheService.generateListKey(this.CACHE_PREFIX),
      );

      return newApproval;
    } catch (error) {
      // Rollback the transaction in case of error
      await trx.rollback();
      throw error;
    }
  }

  async getApprovalThatHasClothingExpense(
    query: QueryApprovalsThatHasClothingExpenseDto,
  ): Promise<{
    data: Approval[];
    meta: {
      total: number;
      page: number;
      limit: number;
      pageTotal: number;
    };
  }> {
    const {
      documentTitle,
      approvalRequestStartDate,
      approvalRequestEndDate,
      incrementId,
      urgencyLevel,
      confidentialityLevel,
      creatorCode,
      statusLabelId,
    } = query;

    const limit = 10;
    const page = 1;
    const offset = (page - 1) * limit;

    // Get current date in Bangkok timezone (YYYY-MM-DD)
    const currentDateBangkok = moment
      .default()
      .tz('Asia/Bangkok')
      .format('YYYY-MM-DD');

    // Subquery: หา start_date ที่น้อยที่สุดของแต่ละ approval
    const minTripDateSubquery = this.knexService
      .knex('approval_trip_date_ranges')
      .select('approval_id')
      .min('start_date as min_start_date')
      .groupBy('approval_id')
      .as('min_trip_dates');

    // 1. Query data
    let approvalQuery = this.knexService
      .knex('approval_clothing_expense')
      .whereNotNull('approval_clothing_expense.approval_id')
      .leftJoin(
        'approval',
        'approval_clothing_expense.approval_id',
        'approval.id',
      )
      .whereNull('approval.deleted_at')
      .leftJoin(
        minTripDateSubquery,
        'approval.id',
        'min_trip_dates.approval_id',
      )
      .leftJoin('OP_MASTER_T', (builder) => {
        builder.on(
          'approval_clothing_expense.employee_code',
          '=',
          this.knexService.knex.raw('RTRIM("OP_MASTER_T"."PMT_CODE")'),
        );
      })
      .leftJoin('approval_trip_date_ranges', (builder) => {
        builder.on('approval.id', '=', 'approval_trip_date_ranges.approval_id');
      })
      .where('min_trip_dates.min_start_date', '>', currentDateBangkok);

    // Apply filters from query params
    if (documentTitle) {
      approvalQuery = approvalQuery.where(
        'approval.document_title',
        'like',
        `%${documentTitle}%`,
      );
    }
    if (incrementId) {
      approvalQuery = approvalQuery.where(
        'approval.increment_id',
        'like',
        `%${incrementId}%`,
      );
    }
    if (urgencyLevel) {
      approvalQuery = approvalQuery.where(
        'approval.urgency_level',
        urgencyLevel,
      );
    }
    if (confidentialityLevel) {
      approvalQuery = approvalQuery.where(
        'approval.confidentiality_level',
        confidentialityLevel,
      );
    }
    if (approvalRequestStartDate && approvalRequestEndDate) {
      approvalQuery = approvalQuery.whereBetween('approval.approval_date', [
        approvalRequestStartDate,
        approvalRequestEndDate,
      ]);
    } else if (approvalRequestStartDate) {
      approvalQuery = approvalQuery.where(
        'approval.approval_date',
        '>=',
        approvalRequestStartDate,
      );
    } else if (approvalRequestEndDate) {
      approvalQuery = approvalQuery.where(
        'approval.approval_date',
        '<=',
        approvalRequestEndDate,
      );
    }
    if (creatorCode) {
      approvalQuery = approvalQuery.where(
        'approval_clothing_expense.employee_code',
        creatorCode,
      );
    }

    if (statusLabelId) {
      approvalQuery = approvalQuery.where(
        'approval.approval_status_label_id',
        statusLabelId,
      );
    }

    console.log(approvalQuery.toSQL());

    const approvals = await approvalQuery
      .select([
        'approval.id as approvalId',
        'approval.increment_id as incrementId',
        'approval.record_type as recordType',
        'approval.name',
        'approval.employee_code as employeeCode',
        'approval.travel_type as travelType',
        'approval.international_sub_option as internationalSubOption',
        'approval.approval_ref as approvalRef',
        'approval.work_start_date as workStartDate',
        'approval.work_end_date as workEndDate',
        'approval.start_country as startCountry',
        'approval.end_country as endCountry',
        'approval.remarks',
        'approval.num_travelers as numTravelers',
        'approval.document_no as documentNo',
        'approval.document_tel as documentTel',
        'approval.document_to as documentTo',
        'approval.document_title as documentTitle',
        'approval.attachment_id as attachmentId',
        'approval.form3_total_outbound as form3TotalOutbound',
        'approval.form3_total_inbound as form3TotalInbound',
        'approval.form3_total_amount as form3TotalAmount',
        'approval.exceed_lodging_rights_checked as exceedLodgingRightsChecked',
        'approval.exceed_lodging_rights_reason as exceedLodgingRightsReason',
        'approval.form4_total_amount as form4TotalAmount',
        'approval.form5_total_amount as form5TotalAmount',
        'approval.approval_date as approvalDate',
        'approval.staff',
        'approval.staff_employee_code as staffEmployeeCode',
        'approval.final_staff_employee_code as finalStaffEmployeeCode',
        'approval.confidentiality_level as confidentialityLevel',
        'approval.urgency_level as urgencyLevel',
        'approval.comments',
        'approval.final_staff as finalStaff',
        'approval.signer_date as signerDate',
        'approval.document_ending as documentEnding',
        'approval.document_ending_wording as documentEndingWording',
        'approval.signer_name as signerName',
        'approval.use_file_signature as useFileSignature',
        'approval.signature_attachment_id as signatureAttachmentId',
        'approval.use_system_signature as useSystemSignature',
        'approval.approval_print_number as approvalPrintNumber',
        'approval.expense_print_number as expensePrintNumber',
        //'approval.user_id as userId',
        'approval.created_employee_code as createdEmployeeCode',
        'approval.created_employee_name as createdEmployeeName',
        'approval.created_at as createdAt',
        'approval.updated_at as updatedAt',
        'approval.deleted_at as deletedAt',
        // min trip date
        'approval_trip_date_ranges.start_date as tripStartDate',
        'approval_trip_date_ranges.end_date as tripEndDate',
        // clothing expense
        'approval_clothing_expense.id as clothingExpenseId',
        'approval_clothing_expense.clothing_file_checked as clothingFileChecked',
        'approval_clothing_expense.clothing_amount as clothingAmount',
        'approval_clothing_expense.clothing_reason as clothingReason',
        'approval_clothing_expense.reporting_date as clothingReportingDate',
        'approval_clothing_expense.next_claim_date as clothingNextClaimDate',
        'approval_clothing_expense.work_end_date as clothingWorkEndDate',
        'approval_clothing_expense.destination_country as clothingDestinationCountry',
        'approval_clothing_expense.attachment_id as clothingAttachmentId',
        'approval_clothing_expense.staff_member_id as clothingStaffMemberId',
        'approval_clothing_expense.employee_code as clothingEmployeeCode',
        'approval_clothing_expense.created_at as clothingCreatedAt',
        'approval_clothing_expense.updated_at as clothingUpdatedAt',
        // OP_MASTER_T
        'OP_MASTER_T.PMT_NAME_T as creatorName',
      ])
      .limit(limit)
      .offset(offset);

    // 2. Query total count (apply same filters)
    let totalQuery = this.knexService
      .knex('approval_clothing_expense')
      .whereNotNull('approval_clothing_expense.approval_id')
      .leftJoin(
        'approval',
        'approval_clothing_expense.approval_id',
        'approval.id',
      )
      .whereNull('approval.deleted_at')
      .leftJoin(
        minTripDateSubquery,
        'approval.id',
        'min_trip_dates.approval_id',
      )
      .where('min_trip_dates.min_start_date', '>', currentDateBangkok);

    if (documentTitle) {
      totalQuery = totalQuery.where(
        'approval.document_title',
        'like',
        `%${documentTitle}%`,
      );
    }
    if (incrementId) {
      totalQuery = totalQuery.where(
        'approval.increment_id',
        'like',
        `%${incrementId}%`,
      );
    }
    if (urgencyLevel) {
      totalQuery = totalQuery.where('approval.urgency_level', urgencyLevel);
    }
    if (confidentialityLevel) {
      totalQuery = totalQuery.where(
        'approval.confidentiality_level',
        confidentialityLevel,
      );
    }
    if (approvalRequestStartDate && approvalRequestEndDate) {
      totalQuery = totalQuery.whereBetween('approval.approval_date', [
        approvalRequestStartDate,
        approvalRequestEndDate,
      ]);
    } else if (approvalRequestStartDate) {
      totalQuery = totalQuery.where(
        'approval.approval_date',
        '>=',
        approvalRequestStartDate,
      );
    } else if (approvalRequestEndDate) {
      totalQuery = totalQuery.where(
        'approval.approval_date',
        '<=',
        approvalRequestEndDate,
      );
    }

    if (creatorCode) {
      totalQuery = totalQuery.where(
        'approval_clothing_expense.employee_code',
        creatorCode,
      );
    }

    if (statusLabelId) {
      totalQuery = totalQuery.where(
        'approval.approval_status_label_id',
        statusLabelId,
      );
    }

    const totalResult = await totalQuery
      .countDistinct('approval_clothing_expense.id as total')
      .first();

    const data = [];
    const seenClothingExpenseIds = new Set();
    for (const approval of approvals) {
      if (seenClothingExpenseIds.has(approval.clothingExpenseId)) {
        continue;
      }
      seenClothingExpenseIds.add(approval.clothingExpenseId);

      data.push({
        ...approval,
        clothingExpense: {
          id: approval.clothingExpenseId,
          clothingFileChecked: approval.clothingFileChecked,
          clothingAmount: approval.clothingAmount,
          clothingReason: approval.clothingReason,
          reportingDate: approval.clothingReportingDate,
          nextClaimDate: approval.clothingNextClaimDate,
          workEndDate: approval.clothingWorkEndDate,
          destinationCountry: approval.clothingDestinationCountry,
          attachmentId: approval.clothingAttachmentId,
          staffMemberId: approval.clothingStaffMemberId,
          employeeCode: approval.clothingEmployeeCode,
          createdAt: approval.clothingCreatedAt,
          updatedAt: approval.clothingUpdatedAt,
        },
      });
    }

    return {
      data: data,
      meta: {
        total: Number(totalResult?.total || 0),
        page,
        limit,
        pageTotal: Math.ceil(Number(totalResult?.total || 0) / limit),
      },
    };
  }
}
