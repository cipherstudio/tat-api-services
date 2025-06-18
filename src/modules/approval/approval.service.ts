import { Injectable, NotFoundException } from '@nestjs/common';
import { Approval } from './entities/approval.entity';
import { CreateApprovalDto } from './dto/create-approval.dto';
import { UpdateApprovalDto } from './dto/update-approval.dto';
import { UpdateApprovalStatusDto } from './dto/update-approval-status.dto';
import { ApprovalQueryOptions } from './interfaces/approval-options.interface';
import { PaginatedResult } from '../../common/interfaces/pagination.interface';
import { RedisCacheService } from '../cache/redis-cache.service';
import { ApprovalRepository } from './repositories/approval.repository';
import { KnexService } from '../../database/knex-service/knex.service';
import { ApprovalDetailResponseDto } from './dto/approval-detail-response.dto';
import { ApprovalDateRangeDto } from './dto/approval-date-range.dto';
import { ApprovalContentDto } from './dto/approval-content.dto';
import { ApprovalTripEntryDto } from './dto/approval-trip-entry.dto';
import { ApprovalStaffMemberDto } from './dto/approval-staff-member.dto';
import { UpdateClothingExpenseDatesDto } from './dto/update-clothing-expense-dates.dto';
import { CheckClothingExpenseEligibilityDto } from './dto/check-clothing-expense-eligibility.dto';
import { ClothingExpenseEligibilityResponseDto } from './dto/clothing-expense-eligibility-response.dto';
//import { ApprovalWorkLocationDto } from './dto/approval-work-location.dto';


@Injectable()
export class ApprovalService {
  private readonly CACHE_PREFIX = 'approval';
  private readonly CACHE_TTL = 3600; // 1 hour in seconds

  constructor(
    private readonly approvalRepository: ApprovalRepository,
    private readonly cacheService: RedisCacheService,
    private readonly knexService: KnexService,
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
    const result = await this.knexService.knex('approval')
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

  async create(createApprovalDto: CreateApprovalDto, userId: number): Promise<Approval> {
    // Start a transaction
    const trx = await this.knexService.knex.transaction();

    try {
      // Generate increment ID
      const incrementId = await this.generateIncrementId();

      // Transform data to snake case
      const data = {
        ...createApprovalDto,
        incrementId,
        userId
      };

      // Create the approval record with increment ID and user ID
      const savedApproval = await this.approvalRepository.create(data, trx);

      // Create the approval status record
      await trx('approval_status').insert({
        status: 'ฉบับร่าง',
        user_id: userId,
        approval_id: savedApproval.id,
        created_at: new Date(),
        updated_at: new Date()
      });

      // Commit the transaction
      await trx.commit();

      // Cache the new approval
      await this.cacheService.set(
        this.cacheService.generateKey(this.CACHE_PREFIX, savedApproval.id),
        savedApproval,
        this.CACHE_TTL
      );

      // Invalidate the list cache
      await this.cacheService.del(this.cacheService.generateListKey(this.CACHE_PREFIX));

      return savedApproval;
    } catch (error) {
      // Rollback the transaction in case of error
      await trx.rollback();
      throw error;
    }
  }

  async findAll(queryOptions?: ApprovalQueryOptions): Promise<PaginatedResult<Approval>> {
    // Try to get from cache first
    const cacheKey = this.cacheService.generateListKey(this.CACHE_PREFIX);
    const cachedResult = await this.cacheService.get<PaginatedResult<Approval>>(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    const {
      page = 1,
      limit = 10,
      orderBy = 'createdAt',
      orderDir = 'DESC',
      includeInactive = false,
      name,
      searchTerm,
    } = queryOptions || {};

    // Prepare conditions
    const conditions: Record<string, any> = {};

    if (name) {
      conditions.name = name;
    }

    // Add soft delete condition
    conditions.deleted_at = null;

    // Convert orderBy from camelCase to snake_case if needed
    const dbOrderBy = orderBy === 'createdAt' ? 'created_at' : 
                     orderBy === 'updatedAt' ? 'updated_at' : orderBy;

    const result = await this.approvalRepository.findWithPagination(
      page,
      limit,
      conditions,
      dbOrderBy,
      orderDir.toLowerCase() as 'asc' | 'desc'
    );

    // If we have a search term, filter results manually
    if (searchTerm && result.data.length > 0) {
      result.data = result.data.filter(item => 
        item.documentTitle?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      result.meta.total = result.data.length;
    }

    // Cache the result
    await this.cacheService.set(cacheKey, result, this.CACHE_TTL);

    return result;
  }

  async findById(id: number): Promise<ApprovalDetailResponseDto> {
    // Try to get from cache first
    const cacheKey = this.cacheService.generateKey(this.CACHE_PREFIX, id);
    const cachedApproval = await this.cacheService.get<ApprovalDetailResponseDto>(cacheKey);
    if (cachedApproval) {
      return cachedApproval;
    }

    // Add soft delete condition to the query
    const approval = await this.knexService.knex('approval')
      .where('id', id)
      .whereNull('deleted_at')
      .select(
        'id',
        'increment_id as incrementId',
        'record_type as recordType',
        'name',
        'employee_code as employeeCode',
        'travel_type as travelType',
        'international_sub_option as internationalSubOption',
        'approval_ref as approvalRef',
        'work_start_date as workStartDate',
        'work_end_date as workEndDate',
        'start_country as startCountry',
        'end_country as endCountry',
        'remarks',
        'num_travelers as numTravelers',
        'document_no as documentNo',
        'document_tel as documentTel',
        'document_to as documentTo',
        'document_title as documentTitle',
        'attachment_id as attachmentId',
        'form3_total_outbound as form3TotalOutbound',
        'form3_total_inbound as form3TotalInbound',
        'form3_total_amount as form3TotalAmount',
        'exceed_lodging_rights_checked as exceedLodgingRightsChecked',
        'exceed_lodging_rights_reason as exceedLodgingRightsReason',
        'form4_total_amount as form4TotalAmount',
        'form5_total_amount as form5TotalAmount',
        'approval_date as approvalDate',
        'staff',
        'comments',
        'final_staff as finalStaff',
        'signer_date as signerDate',
        'document_ending as documentEnding',
        'document_ending_wording as documentEndingWording',
        'signer_name as signerName',
        'use_file_signature as useFileSignature',
        'signature_attachment_id as signatureAttachmentId',
        'use_system_signature as useSystemSignature',
        'user_id as userId',
        'created_at as createdAt',
        'updated_at as updatedAt',
        'deleted_at as deletedAt',
      )
      .first();

    if (!approval) {
      throw new NotFoundException(`Approval with ID ${id} not found`);
    }

    // Map the approval data to the response DTO
    const approvalDto: ApprovalDetailResponseDto = {
      ...approval,
      confidentialityLevel: approval.confidentiality_level ? JSON.parse(approval.confidentiality_level) : undefined,
      urgencyLevel: approval.urgency_level ? JSON.parse(approval.urgency_level) : undefined,
      departments: approval.departments ? JSON.parse(approval.departments) : undefined,
      degrees: approval.degrees ? JSON.parse(approval.degrees) : undefined,
      finalDepartments: approval.final_departments ? JSON.parse(approval.final_departments) : undefined,
      finalDegrees: approval.final_degrees ? JSON.parse(approval.final_degrees) : undefined,
    };

    // Get status history
    const statusHistory = await this.knexService.knex('approval_status')
      .where('approval_id', id)
      .orderBy('created_at', 'desc')
      .select('id', 'status', 'user_id as userId', 'created_at as createdAt');

    // Get travel date ranges
    const travelDateRanges = await this.knexService.knex('approval_date_ranges')
      .where('approval_id', id)
      .select('id', 'start_date as startDate', 'end_date as endDate');

    // Get approval contents
    const approvalContents = await this.knexService.knex('approval_contents')
      .where('approval_id', id)
      .select('id', 'detail');

    // Get trip entries
    const tripEntries = await this.knexService.knex('approval_trip_entries')
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
      const tripDateRanges = await this.knexService.knex('approval_trip_date_ranges')
        .where('approval_trip_entries_id', tripEntry.id)
        .select('id', 'start_date as startDate', 'end_date as endDate');
      tripEntry.tripDateRanges = tripDateRanges;
    }

    // Get staff members
    const staffMembers = await this.knexService.knex('approval_staff_members')
      .where('approval_id', id)
      .select(
        'id',
        'employee_code as employeeCode',
        'type',
        'name',
        'role',
        'position',
        'right_equivalent as rightEquivalent',
        'organization_position as organizationPosition'
      );

    // Get work locations for each staff member
    for (const staffMember of staffMembers) {
      const workLocations = await this.knexService.knex('approval_work_locations')
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
          'destination_table as destinationTable'
        );

      // Get trip date ranges for each work location
      for (const workLocation of workLocations) {
        const workLocationTripDateRanges = await this.knexService.knex('approval_work_locations_date_ranges')
          .where('approval_work_locations_id', workLocation.id)
          .where('approval_id', id)
          .select('id', 'start_date as startDate', 'end_date as endDate');
        workLocation.tripDateRanges = workLocationTripDateRanges;
      }

      // Get transportation expenses for each work location
      for (const workLocation of workLocations) {
        const transportationExpenses = await this.knexService.knex('approval_transportation_expense')
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
            'total_amount as totalAmount'
          );
        workLocation.transportationExpenses = transportationExpenses;
      }

      // Get accommodation expenses for each work location
      for (const workLocation of workLocations) {
        const accommodationExpenses = await this.knexService.knex('approval_accommodation_expense')
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
            'moving_cost_rate as movingCostRate'
          );

        // Get accommodation transport expenses for each accommodation expense
        for (const accommodationExpense of accommodationExpenses) {
          const accommodationTransportExpenses = await this.knexService.knex('approval_accommodation_transport_expense')
            .where('approval_accommodation_expense_id', accommodationExpense.id)
            .where('approval_id', id)
            .select(
              'id',
              'type',
              'amount',
              'checked',
              'flight_route as flightRoute'
            );
          accommodationExpense.accommodationTransportExpenses = accommodationTransportExpenses;

          // Get accommodation holiday expenses for each accommodation expense
          const accommodationHolidayExpenses = await this.knexService.knex('approval_accommodation_holiday_expense')
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
              'note'
            );
          accommodationExpense.accommodationHolidayExpenses = accommodationHolidayExpenses;
        }

        workLocation.accommodationExpenses = accommodationExpenses;
      }

      staffMember.workLocations = workLocations;

      // Get entertainment expenses for each staff member
      const entertainmentExpenses = await this.knexService.knex('approval_entertainment_expense')
        .where('staff_member_id', staffMember.id)
        .where('approval_id', id)
        .select(
          'id',
          'entertainment_short_checked as entertainmentShortChecked',
          'entertainment_long_checked as entertainmentLongChecked',
          'entertainment_amount as entertainmentAmount'
        );
      staffMember.entertainmentExpenses = entertainmentExpenses;

      // Get clothing expenses for each staff member
      const clothingExpenses = await this.knexService.knex('approval_clothing_expense')
        .where('employee_code', staffMember.employeeCode)
        .where('approval_id', id)
        .select(
          'id',
          'clothing_file_checked as clothingFileChecked',
          'clothing_amount as clothingAmount',
          'clothing_reason as clothingReason',
          'reporting_date as reportingDate',
          'next_claim_date as nextClaimDate',
          'work_end_date as workEndDate'
        );
      staffMember.clothingExpenses = clothingExpenses;
    }

    // Get other expenses
    const otherExpenses = await this.knexService.knex('approval_other_expense')
      .where('approval_id', id)
      .select(
        'id',
        'type',
        'amount',
        'position',
        'reason',
        'acknowledged'
      );

    // Get conditions
    const conditions = await this.knexService.knex('approval_conditions')
      .where('approval_id', id)
      .select('id', 'text');

    // Get budgets
    const budgets = await this.knexService.knex('approval_budgets')
      .where('approval_id', id)
      .select(
        'id',
        'budget_type as budgetType',
        'item_type as itemType',
        'reservation_code as reservationCode',
        'department',
        'budget_code as budgetCode'
      );

    // Combine all the data
    const response: ApprovalDetailResponseDto = {
      ...approvalDto,
      statusHistory,
      currentStatus: statusHistory[0]?.status || 'ฉบับร่าง',
      travelDateRanges,
      approvalContents,
      tripEntries,
      staffMembers,
      otherExpenses,
      conditions,
      budgets
    };

    // Cache the result
    await this.cacheService.set(cacheKey, response, this.CACHE_TTL);

    return response;
  }

  async update(id: number, updateDto: UpdateApprovalDto): Promise<Approval> {
    const approval = await this.findById(id);
    if (!approval) {
      throw new NotFoundException(`Approval with ID ${id} not found`);
    }

    // Start a transaction
    const trx = await this.knexService.knex.transaction();

    try {
      // Update approval record
      await trx('approval')
        .where('id', id)
        .update({
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
          staff: updateDto.staff,
          comments: updateDto.comments,
          approval_date: updateDto.approvalDate,
          final_staff: updateDto.finalStaff,
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
      if (updateDto.travelDateRanges && Array.isArray(updateDto.travelDateRanges)) {
        console.log('Processing travel date ranges:', JSON.stringify(updateDto.travelDateRanges, null, 2));
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
      if (updateDto.approvalContents && Array.isArray(updateDto.approvalContents)) {
        console.log('Processing approval contents:', JSON.stringify(updateDto.approvalContents, null, 2));
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
        console.log('Processing trip entries:', JSON.stringify(updateDto.tripEntries, null, 2));
        await trx('approval_trip_entries').where('approval_id', id).delete();
        for (const entry of updateDto.tripEntries) {
          if (entry && typeof entry === 'object') {
            const [tripEntryId] = await trx('approval_trip_entries').insert({
              approval_id: id,
              location: entry.location,
              destination: entry.destination,
              nearby_provinces: entry.nearbyProvinces,
              details: entry.details,
              destination_type: entry.destinationType,
              destination_id: entry.destinationId,
              destination_table: entry.destinationTable,
            }).returning('id');

            if (entry.tripDateRanges && Array.isArray(entry.tripDateRanges)) {
              // Delete existing trip date ranges for this trip entry
              await trx('approval_trip_date_ranges')
                .where('approval_id', id)
                .delete();

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
        console.log('Processing staff members:', JSON.stringify(updateDto.staffMembers, null, 2));
        await trx('approval_staff_members').where('approval_id', id).delete();
        await trx('approval_work_locations').where('approval_id', id).delete();
        await trx('approval_work_locations_date_ranges').where('approval_id', id).delete();
        await trx('approval_transportation_expense').where('approval_id', id).delete();
        await trx('approval_accommodation_expense').where('approval_id', id).delete();
        await trx('approval_accommodation_transport_expense').where('approval_id', id).delete();
        await trx('approval_accommodation_holiday_expense').where('approval_id', id).delete();
        await trx('approval_entertainment_expense').where('approval_id', id).delete();
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
                  const [accommodationExpense] = await trx('approval_accommodation_expense')
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
                      lodging_double_person_external: expense.lodgingDoublePersonExternal,
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
                      await trx('approval_accommodation_transport_expense')
                        .insert({
                          approval_id: id,
                          approval_accommodation_expense_id: accommodationExpense.id,
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
                  if (Array.isArray(workLocation.accommodationHolidayExpenses)) {
                    for (const holidayExpense of workLocation.accommodationHolidayExpenses) {
                      await trx('approval_accommodation_holiday_expense')
                        .insert({
                          approval_id: id,
                          approval_accommodation_expense_id: accommodationExpense.id,
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
                    entertainment_short_checked: expense.entertainmentShortChecked,
                    entertainment_long_checked: expense.entertainmentLongChecked,
                    entertainment_amount: expense.entertainmentAmount,
                    created_at: new Date(),
                    updated_at: new Date(),
                  });
                }
              }

              // Process clothing expenses
              if (Array.isArray(staffMember.clothingExpenses)) {
                for (const expense of staffMember.clothingExpenses) {
                  // Check if record exists
                  const existingExpense = await trx('approval_clothing_expense')
                    .where({
                      approval_id: id,
                      employee_code: staffMember.employeeCode
                    })
                    .first();

                  if (existingExpense) {
                    // Update existing record
                    await trx('approval_clothing_expense')
                      .where({
                        approval_id: id,
                        employee_code: staffMember.employeeCode
                      })
                      .update({
                        clothing_file_checked: expense.clothingFileChecked,
                        clothing_amount: expense.clothingAmount,
                        clothing_reason: expense.clothingReason,
                        reporting_date: null, // ไม่ต้องส่ง มาจาก cron + manual save
                        next_claim_date: expense.nextClaimDate, // ไม่ส่ง คำนวนจากหลังบ้าน
                        work_end_date: expense.workEndDate, // ไม่ต้องส่ง เอามาจาก step 1
                        increment_id: null, // ไม่ต้องส่ง เอามาจากหลังบ้าน
                        destination_country: null, // ไม่ต้องส่ง เอามาจากหลังบ้าน
                        updated_at: new Date()
                      });
                  } else {
                    // Insert new record
                    await trx('approval_clothing_expense').insert({
                      approval_id: id,
                      staff_member_id: insertedStaffMember.id,
                      employee_code: staffMember.employeeCode,
                      clothing_file_checked: expense.clothingFileChecked,
                      clothing_amount: expense.clothingAmount,
                      clothing_reason: expense.clothingReason,
                      reporting_date: null, // ไม่ต้องส่ง มาจาก cron + manual save
                      next_claim_date: expense.nextClaimDate, // ไม่ส่ง คำนวนจากหลังบ้าน
                      work_end_date: expense.workEndDate, // ไม่ต้องส่ง เอามาจาก step 1
                      increment_id: null, // ไม่ต้องส่ง เอามาจากหลังบ้าน
                      destination_country: null, // ไม่ต้องส่ง เอามาจากหลังบ้าน
                      created_at: new Date(),
                      updated_at: new Date()
                    });
                  }
                }
              }
            }
          }
        }
      }

      // After processing all staff members, clean up old clothing expenses
      if (updateDto.staffMembers && Array.isArray(updateDto.staffMembers)) {
        // Get all employee codes from current staff members
        const currentEmployeeCodes = updateDto.staffMembers.map(staff => staff.employeeCode);

        // Delete clothing expenses for employee codes that are no longer in the staff members list
        await trx('approval_clothing_expense')
          .where('approval_id', id)
          .whereNotIn('employee_code', currentEmployeeCodes)
          .delete();
      }

      // Process other expenses
      if (updateDto.otherExpenses && Array.isArray(updateDto.otherExpenses)) {
        console.log('Processing other expenses:', JSON.stringify(updateDto.otherExpenses, null, 2));
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
        console.log('Processing conditions:', JSON.stringify(updateDto.conditions, null, 2));
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
        console.log('Processing budgets:', JSON.stringify(updateDto.budgets, null, 2));
        await trx('approval_budgets').where('approval_id', id).delete();
        for (const budget of updateDto.budgets) {
          if (budget && typeof budget === 'object') {
            await trx('approval_budgets').insert({
              approval_id: id,
              budget_type: budget.budget_type,
              item_type: budget.item_type,
              reservation_code: budget.reservation_code,
              department: budget.department,
              budget_code: budget.budget_code,
            });
          }
        }
      }

      // Process JSON fields
      const updateData: any = {};

      if (updateDto.confidentialityLevel && Array.isArray(updateDto.confidentialityLevel)) {
        console.log('Processing confidentiality levels:', JSON.stringify(updateDto.confidentialityLevel, null, 2));
        updateData.confidentiality_level = JSON.stringify(updateDto.confidentialityLevel);
      }

      if (updateDto.urgencyLevel && Array.isArray(updateDto.urgencyLevel)) {
        console.log('Processing urgency levels:', JSON.stringify(updateDto.urgencyLevel, null, 2));
        updateData.urgency_level = JSON.stringify(updateDto.urgencyLevel);
      }

      if (updateDto.departments && Array.isArray(updateDto.departments)) {
        console.log('Processing departments:', JSON.stringify(updateDto.departments, null, 2));
        updateData.departments = JSON.stringify(updateDto.departments);
      }

      if (updateDto.degrees && Array.isArray(updateDto.degrees)) {
        console.log('Processing degrees:', JSON.stringify(updateDto.degrees, null, 2));
        updateData.degrees = JSON.stringify(updateDto.degrees);
      }

      if (updateDto.finalDepartments && Array.isArray(updateDto.finalDepartments)) {
        console.log('Processing final departments:', JSON.stringify(updateDto.finalDepartments, null, 2));
        updateData.final_departments = JSON.stringify(updateDto.finalDepartments);
      }

      if (updateDto.finalDegrees && Array.isArray(updateDto.finalDegrees)) {
        console.log('Processing final degrees:', JSON.stringify(updateDto.finalDegrees, null, 2));
        updateData.final_degrees = JSON.stringify(updateDto.finalDegrees);
      }

      if (Object.keys(updateData).length > 0) {
        await trx('approval')
          .where('id', id)
          .update(updateData);
      }

      // Commit the transaction
      await trx.commit();

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

    const result = await this.approvalRepository.softDelete(id);
    if (!result) {
      throw new NotFoundException(`Approval with ID ${id} not found`);
    }

    // Remove from cache
    await this.cacheService.del(this.cacheService.generateKey(this.CACHE_PREFIX, id));
    // Invalidate the list cache
    await this.cacheService.del(this.cacheService.generateListKey(this.CACHE_PREFIX));
  }

  async updateStatus(id: number, updateStatusDto: UpdateApprovalStatusDto, userId: number): Promise<void> {
    const approval = await this.findById(id);
    if (!approval) {
      throw new NotFoundException(`Approval with ID ${id} not found`);
    }

    // Start a transaction
    const trx = await this.knexService.knex.transaction();

    try {
      // Insert new status record
      await trx('approval_status').insert({
        status: updateStatusDto.status,
        user_id: userId,
        approval_id: id,
        created_at: new Date(),
        updated_at: new Date()
      });

      // Commit the transaction
      await trx.commit();

      // Invalidate the cache
      await this.cacheService.del(this.cacheService.generateKey(this.CACHE_PREFIX, id));
      await this.cacheService.del(this.cacheService.generateListKey(this.CACHE_PREFIX));
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
      await trx('approval_clothing_expense')
        .where('approval_id', id)
        .update({
          reporting_date: updateDatesDto.reportingDate,
          next_claim_date: updateDatesDto.nextClaimDate,
          ddwork_end_date: updateDatesDto.ddworkEndDate,
          updated_at: new Date(),
        });

      // Commit the transaction
      await trx.commit();

      // Invalidate the cache
      await this.cacheService.del(this.cacheService.generateKey(this.CACHE_PREFIX, id));
      await this.cacheService.del(this.cacheService.generateListKey(this.CACHE_PREFIX));
    } catch (error) {
      // Rollback the transaction in case of error
      await trx.rollback();
      throw error;
    }
  }

  async checkClothingExpenseEligibility(
    checkEligibilityDto: CheckClothingExpenseEligibilityDto,
  ): Promise<ClothingExpenseEligibilityResponseDto[]> {

    const employeeCodes = checkEligibilityDto.employees.map(emp => emp.employeeCode);

    // set default result isEligible false
    const result = employeeCodes.map(employeeCode => ({
      employeeCode,
      isEligible: false,
    }));

    if (!['international', 'temporary-international'].includes(checkEligibilityDto.travelType)) {
      // return all employee codes with isEligible false
      return result;
    }

    if (checkEligibilityDto.travelType === 'international') {
      await this.processInternationalEligibility(checkEligibilityDto, result);
    } else if (checkEligibilityDto.travelType === 'temporary-international') {
      await this.processTemporaryInternationalEligibility(checkEligibilityDto, result);
    } else {
      // ถ้าเป็นประเภทอื่นๆ, set isEligible false
      result.forEach(r => r.isEligible = false);
    }

    return result;
  }

  private async processInternationalEligibility(
    checkEligibilityDto: CheckClothingExpenseEligibilityDto,
    result: ClothingExpenseEligibilityResponseDto[]
  ): Promise<void> {
    for (const employeeCode of result.map(r => r.employeeCode)) {
      const pwJob = await this.getPwJob(employeeCode);

      // ถ้าไม่เจอข้อมูลการเบิกล่าสุด, set isEligible true
      if (!pwJob) {
        this.updateEligibility(result, employeeCode, true);
      } else {
        await this.processPwJobForInternational(pwJob, checkEligibilityDto, result, employeeCode);
      }
    }
  }

  private async processTemporaryInternationalEligibility(
    checkEligibilityDto: CheckClothingExpenseEligibilityDto,
    result: ClothingExpenseEligibilityResponseDto[]
  ): Promise<void> {
    for (const employeeCode of result.map(r => r.employeeCode)) {
      const pwJob = await this.getPwJob(employeeCode);

      // ถ้าไม่เจอข้อมูลการเบิกล่าสุด, set isEligible true
      if (!pwJob) {
        this.updateEligibility(result, employeeCode, true);
      } else {
        await this.processPwJobForTemporaryInternational(pwJob, checkEligibilityDto, result, employeeCode);
      }
    }
  }

  private async getPwJob(employeeCode: number) {
    return await this.knexService.knex('PS_PW_JOB_TEMP')
      .where('EMPLID', employeeCode)
      .andWhere('ACTION', 'XFR')
      .andWhere('ACTION_REASON', '008')
      .first();
  }

  private async processPwJobForInternational(
    pwJob: any,
    checkEligibilityDto: CheckClothingExpenseEligibilityDto,
    result: ClothingExpenseEligibilityResponseDto[],
    employeeCode: number
  ): Promise<void> {
    // เอา pwJob.DEPTID ไปเช็ค table OP_ORGANIZE_R_TEMP ว่าเป็นหน่วยงานต่างประเทศไหม
    const organize = await this.knexService.knex('OP_ORGANIZE_R_TEMP')
      .where('DEPTID', pwJob.DEPTID)
      .first();

    if (organize.POG_TYPE == 3) { // POG_TYPE 2 = ในประเทศ / 3 = ต่างประเทศ
      // ถ้าเป็นหน่วยงานต่างประเทศ
      // เอา organize.POG_CODE ไปเช็ค table office_international ว่าเป็นสำนักงาน นั้นเป็น ประเภทไหน

      // หา ประเภท A B C ของ office internatinal จากใบเก่า
      const oldDestination = await this.knexService.knex('office_international')
        .where('pog_code', organize.POG_CODE)
        .join('countries', 'office_international.country_id', 'countries.id')
        .first();

      // หา ประเภท A B C ของ current destination employee
      const destination = checkEligibilityDto.employees.find(emp => emp.employeeCode === employeeCode);
      let currentDestination;
      if (destination.destinationTable === 'countries') {
        currentDestination = await this.knexService.knex('countries')
          .where('id', destination.destinationId)
          .first();
      } else if (destination.destinationTable === 'tatOffices') {
        currentDestination = await this.knexService.knex('tat_offices')
          .where('id', destination.destinationId)
          .join('countries', 'tat_offices.country_id', 'countries.id')
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
          const isOverTwoYears = this.isOverTwoYears(pwJob.EFFDT, checkEligibilityDto.workStartDate);
          this.updateEligibility(result, employeeCode, isOverTwoYears);
        }
      } else {
        this.updateEligibility(result, employeeCode, true);
      }

    } else {
      // @todo ถ้าเป็น type อื่นๆ
    }
  }

  private async processPwJobForTemporaryInternational(
    pwJob: any,
    checkEligibilityDto: CheckClothingExpenseEligibilityDto,
    result: ClothingExpenseEligibilityResponseDto[],
    employeeCode: number
  ): Promise<void> {
    // @todo ต้องเช็คว่า ครั้งก่อนเบิกประเภทไหน
    if (true) { // ex ครั้งก่อนเป็นประจำ, set isEligible true
      this.updateEligibility(result, employeeCode, true);
    } else { // ex ครั้งก่อนเป็นชั่วคราว
      // ให้เอา EFFDT จาก pwJob มาเช็คกับ checkEligibilityDto.workStartDate ว่าเกิน 2 ปี หรือยัง ถ้าเกินแล้ว, set isEligible true
      // @todo อาจต้องเปลี่ยนไปเช็ค วันรายงานตัวกับ ViewDutyformCommands (รอคอนเฟิม)
      const isOverTwoYears = this.isOverTwoYears(pwJob.EFFDT, checkEligibilityDto.workStartDate);
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
    isEligible: boolean
  ): void {
    const employeeResult = result.find(r => r.employeeCode === employeeCode);
    if (employeeResult) {
      employeeResult.isEligible = isEligible;
    }
  }
}
