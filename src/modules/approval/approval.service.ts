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
    const year = new Date().getFullYear();
    const result = await this.knexService.knex('approval')
      .where('increment_id', 'like', `${year}%`)
      .orderBy('increment_id', 'desc')
      .first();

    let sequence = 1;
    if (result?.increment_id) {
      const lastSequence = parseInt(result.increment_id.slice(-4));
      sequence = lastSequence + 1;
    }

    return `${year}${sequence.toString().padStart(4, '0')}`;
  }

  async create(createApprovalDto: CreateApprovalDto, userId: number): Promise<Approval> {
    // Start a transaction
    const trx = await this.knexService.knex.transaction();

    try {
      // Generate increment ID
      const incrementId = await this.generateIncrementId();

      // Create the approval record with increment ID
      const savedApproval = await this.approvalRepository.create({
        ...createApprovalDto,
        incrementId
      }, trx);

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
      isActive,
      searchTerm,
    } = queryOptions || {};

    // Prepare conditions
    const conditions: Record<string, any> = {};
    
    if (isActive !== undefined) {
      conditions.is_active = isActive;
    } else if (!includeInactive) {
      conditions.is_active = true;
    }

    if (name) {
      conditions.name = name;
    }

    // Add soft delete condition
    conditions.deleted_at = null;

    // Convert orderBy from camelCase to snake_case if needed
    const dbOrderBy = orderBy === 'createdAt' ? 'created_at' : 
                     orderBy === 'updatedAt' ? 'updated_at' : 
                     orderBy === 'isActive' ? 'is_active' : orderBy;

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
      .first();

    if (!approval) {
      throw new NotFoundException(`Approval with ID ${id} not found`);
    }

    // Get status history
    const statusHistory = await this.knexService.knex('approval_status')
      .where('approval_id', id)
      .orderBy('created_at', 'desc')
      .select('id', 'status', 'user_id as userId', 'created_at as createdAt');

    // Get transportation expenses
    const transportationExpenses = await this.knexService.knex('approval_transportation_expense')
      .where('approval_id', id)
      .select(
        'id',
        'staff_member_id as staffId',
        'work_location_id as workLocationId',
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
        'budget_type',
        'item_type',
        'reservation_code',
        'department',
        'budget_code'
      );

    // Transform transportation expenses to match DTO structure
    const transformedExpenses = transportationExpenses.map(expense => ({
      id: expense.id,
      staffId: expense.staffId,
      workLocationId: expense.workLocationId,
      travelType: expense.travelType,
      expenseType: expense.expenseType,
      travelMethod: expense.travelMethod,
      outbound: expense.outboundOrigin ? {
        origin: expense.outboundOrigin,
        destination: expense.outboundDestination,
        trips: expense.outboundTrips,
        expense: expense.outboundExpense,
        total: expense.outboundTotal
      } : undefined,
      inbound: expense.inboundOrigin ? {
        origin: expense.inboundOrigin,
        destination: expense.inboundDestination,
        trips: expense.inboundTrips,
        expense: expense.inboundExpense,
        total: expense.inboundTotal
      } : undefined,
      totalAmount: expense.totalAmount
    }));

    const currentStatus = statusHistory[0]?.status || 'ฉบับร่าง';

    const response: ApprovalDetailResponseDto = {
      ...approval,
      statusHistory,
      currentStatus,
      transportationExpenses: transformedExpenses,
      otherExpenses,
      conditions,
      budgets,
      form3TotalOutbound: approval.form3_total_outbound,
      form3TotalInbound: approval.form3_total_inbound,
      form3TotalAmount: approval.form3_total_amount
    };

    // Cache the result
    await this.cacheService.set(cacheKey, response, this.CACHE_TTL);

    return response;
  }

  async update(id: number, updateApprovalDto: UpdateApprovalDto): Promise<Approval> {
    const approval = await this.findById(id);
    if (!approval) {
      throw new NotFoundException(`Approval with ID ${id} not found`);
    }

    // Start a transaction
    const trx = await this.knexService.knex.transaction();

    try {
      // Update approval record with form 3 totals
      const approvalUpdateData = {
        ...updateApprovalDto,
        form3_total_outbound: updateApprovalDto.form3TotalOutbound,
        form3_total_inbound: updateApprovalDto.form3TotalInbound,
        form3_total_amount: updateApprovalDto.form3TotalAmount,
      };
      await this.approvalRepository.update(id, approvalUpdateData, trx);

      // Handle transportation expenses
      // First, delete all existing transportation expenses for this approval
      await trx('approval_transportation_expense')
        .where('approval_id', id)
        .delete();

      // Process transportation expenses from staff members' work locations
      const expensesToInsert = [];
      for (const staffMember of updateApprovalDto.staffMembers) {
        for (const workLocation of staffMember.workLocations) {
          if (workLocation.transportationExpenses?.length > 0) {
            // Get staff member ID from employee code
            const staffMemberRecord = await trx('staff_member')
              .where('employee_code', staffMember.employeeCode)
              .first();

            if (!staffMemberRecord) {
              throw new NotFoundException(`Staff member with employee code ${staffMember.employeeCode} not found`);
            }

            // Get work location ID from location and destination
            const workLocationRecord = await trx('work_location')
              .where('location', workLocation.location)
              .where('destination', workLocation.destination)
              .first();

            if (!workLocationRecord) {
              throw new NotFoundException(`Work location with location ${workLocation.location} and destination ${workLocation.destination} not found`);
            }

            // Add transportation expenses
            for (const expense of workLocation.transportationExpenses) {
              expensesToInsert.push({
                approval_id: id,
                staff_member_id: staffMemberRecord.id,
                work_location_id: workLocationRecord.id,
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
                updated_at: new Date()
              });
            }
          }
        }
      }

      if (expensesToInsert.length > 0) {
        await trx('approval_transportation_expense').insert(expensesToInsert);
      }

      // Handle other expenses
      // First, delete all existing other expenses for this approval
      await trx('approval_other_expense')
        .where('approval_id', id)
        .delete();

      // If otherExpenses is provided and not empty, insert new expenses
      if (updateApprovalDto.otherExpenses?.length > 0) {
        const otherExpensesToInsert = updateApprovalDto.otherExpenses.map(expense => ({
          approval_id: id,
          type: expense.type,
          amount: expense.amount,
          position: expense.position,
          reason: expense.reason,
          acknowledged: expense.acknowledged,
          created_at: new Date(),
          updated_at: new Date()
        }));

        await trx('approval_other_expense').insert(otherExpensesToInsert);
      }

      // Handle conditions
      // First, delete all existing conditions for this approval
      await trx('approval_conditions')
        .where('approval_id', id)
        .delete();

      // If conditions is provided and not empty, insert new conditions
      if (updateApprovalDto.conditions?.length > 0) {
        const conditionsToInsert = updateApprovalDto.conditions.map(condition => ({
          approval_id: id,
          text: condition.text,
          created_at: new Date(),
          updated_at: new Date()
        }));

        await trx('approval_conditions').insert(conditionsToInsert);
      }

      // Handle budgets
      // First, delete all existing budgets for this approval
      await trx('approval_budgets')
        .where('approval_id', id)
        .delete();

      // If budgets is provided and not empty, insert new budgets
      if (updateApprovalDto.budgets?.length > 0) {
        const budgetsToInsert = updateApprovalDto.budgets.map(budget => ({
          approval_id: id,
          budget_type: budget.budget_type,
          item_type: budget.item_type,
          reservation_code: budget.reservation_code,
          department: budget.department,
          budget_code: budget.budget_code,
          created_at: new Date(),
          updated_at: new Date()
        }));

        await trx('approval_budgets').insert(budgetsToInsert);
      }

      // Handle date ranges
      // First, delete all existing date ranges for this approval
      await trx('approval_date_ranges')
        .where('approval_id', id)
        .delete();

      // If travelDateRanges is provided and not empty, insert new ranges
      if (updateApprovalDto.travelDateRanges?.length > 0) {
        const dateRangesToInsert = updateApprovalDto.travelDateRanges.map(range => ({
          approval_id: id,
          start_date: range.start,
          end_date: range.end,
          created_at: new Date(),
          updated_at: new Date()
        }));

        await trx('approval_date_ranges').insert(dateRangesToInsert);
      }

      // Handle approval contents
      // First, delete all existing contents for this approval
      await trx('approval_contents')
        .where('approval_id', id)
        .delete();

      // If approvalContents is provided and not empty, insert new contents
      if (updateApprovalDto.approvalContents?.length > 0) {
        const contentsToInsert = updateApprovalDto.approvalContents.map(content => ({
          approval_id: id,
          detail: content.detail,
          created_at: new Date(),
          updated_at: new Date()
        }));

        await trx('approval_contents').insert(contentsToInsert);
      }

      // Handle staff members and their work locations
      // First, delete all existing work locations and their date ranges
      await trx('approval_work_locations_date_ranges')
        .where('approval_id', id)
        .delete();

      await trx('approval_work_locations')
        .where('approval_id', id)
        .delete();

      await trx('approval_staff_members')
        .where('approval_id', id)
        .delete();

      // If staffMembers is provided and not empty, insert new members and their work locations
      if (updateApprovalDto.staffMembers?.length > 0) {
        for (const member of updateApprovalDto.staffMembers) {
          // Insert staff member
          const [staffMemberId] = await trx('approval_staff_members').insert({
            approval_id: id,
            employee_code: member.employeeCode,
            type: member.type,
            name: member.name,
            role: member.role,
            position: member.position,
            right_equivalent: member.rightEquivalent,
            organization_position: member.organizationPosition,
            created_at: new Date(),
            updated_at: new Date()
          });

          // Handle work locations for this staff member
          if (member.workLocations?.length > 0) {
            for (const location of member.workLocations) {
              // Insert work location
              const [workLocationId] = await trx('approval_work_locations').insert({
                approval_id: id,
                staff_member_id: staffMemberId,
                location: location.location,
                destination: location.destination,
                nearby_provinces: location.nearbyProvinces,
                details: location.details,
                checked: location.checked,
                destination_type: location.destinationType,
                created_at: new Date(),
                updated_at: new Date()
              });

              // Handle work location date ranges
              if (location.tripDateRanges?.length > 0) {
                const dateRangesToInsert = location.tripDateRanges.map(range => ({
                  approval_id: id,
                  approval_work_locations_id: workLocationId,
                  start_date: range.start,
                  end_date: range.end,
                  created_at: new Date(),
                  updated_at: new Date()
                }));

                await trx('approval_work_locations_date_ranges').insert(dateRangesToInsert);
              }
            }
          }
        }
      }

      // Commit the transaction
      await trx.commit();

      // Get updated approval
      const updatedApproval = await this.findById(id);

      // Update cache
      const cacheKey = this.cacheService.generateKey(this.CACHE_PREFIX, id);
      await this.cacheService.set(cacheKey, updatedApproval, this.CACHE_TTL);

      // Invalidate the list cache
      await this.cacheService.del(this.cacheService.generateListKey(this.CACHE_PREFIX));

      return updatedApproval;
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
    const currentDate = new Date();

    // Get all clothing expense records for the given employee codes
    const clothingExpenses = await this.knexService.knex('approval_clothing_expense')
      .whereIn('employee_code', checkEligibilityDto.employeeCodes)
      .select('employee_code', 'next_claim_date');

    // Create a map of employee codes to their next claim dates
    const employeeNextClaimDates = new Map(
      clothingExpenses.map(expense => [expense.employee_code, expense.next_claim_date])
    );

    // Check eligibility for each employee code
    return checkEligibilityDto.employeeCodes.map(employeeCode => {
      const nextClaimDate = employeeNextClaimDates.get(employeeCode);
      const isEligible = !nextClaimDate || new Date(nextClaimDate) < currentDate;

      return {
        employeeCode,
        isEligible,
      };
    });
  }
}
