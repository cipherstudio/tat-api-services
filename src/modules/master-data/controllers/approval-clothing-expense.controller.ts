import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ApprovalClothingExpenseService } from '../services/approval-clothing-expense.service';
import { CreateApprovalClothingExpenseDto } from '../dto/create-approval-clothing-expense.dto';
import { UpdateApprovalClothingExpenseDto } from '../dto/update-approval-clothing-expense.dto';
import { ApprovalClothingExpenseQueryDto } from '../dto/approval-clothing-expense-query.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('Master Data')
@Controller('master-data/approval-clothing-expense')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ApprovalClothingExpenseController {
  constructor(
    private readonly approvalClothingExpenseService: ApprovalClothingExpenseService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get all approval clothing expenses (with pagination)',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search term' })
  @ApiQuery({ name: 'order_by', required: false, type: String, description: 'Order by field' })
  @ApiQuery({ name: 'direction', required: false, type: String, description: 'Order direction (asc/desc)' })
  @ApiQuery({ name: 'clothing_file_checked', required: false, type: Boolean, description: 'Clothing file checked status' })
  @ApiQuery({ name: 'clothing_amount', required: false, type: Number, description: 'Clothing amount' })
  @ApiQuery({ name: 'clothing_reason', required: false, type: String, description: 'Clothing reason' })
  @ApiQuery({ name: 'reporting_date', required: false, type: String, description: 'Reporting date' })
  @ApiQuery({ name: 'next_claim_date', required: false, type: String, description: 'Next claim date' })
  @ApiQuery({ name: 'work_start_date', required: false, type: String, description: 'Work start date' })
  @ApiQuery({ name: 'work_end_date', required: false, type: String, description: 'Work end date' })
  @ApiQuery({ name: 'staff_member_id', required: false, type: Number, description: 'Staff member ID' })
  @ApiQuery({ name: 'approval_id', required: false, type: Number, description: 'Approval ID' })
  @ApiQuery({ name: 'employee_code', required: false, type: Number, description: 'Employee code' })
  @ApiQuery({ name: 'increment_id', required: false, type: String, description: 'Increment ID' })
  @ApiQuery({ name: 'destination_country', required: false, type: String, description: 'Destination country' })
  @ApiQuery({ name: 'is_overdue', required: false, type: Boolean, description: 'Overdue status filter' })
  @ApiOkResponse({
    description: 'List of approval clothing expenses with pagination meta',
    schema: {
      example: {
        data: [
          {
            id: 1,
            clothingFileChecked: true,
            clothingAmount: 1000,
            clothingReason: 'Example reason',
            reportingDate: '2024-01-01',
            nextClaimDate: '2024-02-01',
            workStartDate: '2024-01-01',
            workEndDate: '2024-03-01',
            createdAt: '2024-06-16T00:00:00.000Z',
            updatedAt: '2024-06-16T00:00:00.000Z',
            approvalAccommodationExpenseId: 1,
            staffMemberId: 1,
            approvalId: 1,
            employeeCode: 12345,
            incrementId: 'INC001',
            destinationCountry: 'Thailand',
            // Additional fields from joins
            employeePmtCode: '66019',
            employeeNameTh: 'ชื่อภาษาไทย',
            employeeNameEn: 'English Name',
            employeePosition: 'ตำแหน่งงาน',
            employeeFaculty: 'คณะ/หน่วยงาน',
            employeeEmail: 'email@example.com',
            approvalTravelType: 'domestic',
          },
        ],
        meta: { total: 1, page: 1, limit: 10, lastPage: 1 },
      },
    },
  })
  async findAll(
    @Query('page', new ValidationPipe({ transform: true })) page?: number,
    @Query('limit', new ValidationPipe({ transform: true })) limit?: number,
    @Query('search') search?: string,
    @Query('order_by') order_by?: string,
    @Query('direction') direction?: 'asc' | 'desc',
    @Query('clothing_file_checked', new ValidationPipe({ transform: true })) clothing_file_checked?: boolean,
    @Query('clothing_amount', new ValidationPipe({ transform: true })) clothing_amount?: number,
    @Query('clothing_reason') clothing_reason?: string,
    @Query('reporting_date') reporting_date?: string,
    @Query('next_claim_date') next_claim_date?: string,
    @Query('work_start_date') work_start_date?: string,
    @Query('work_end_date') work_end_date?: string,
    @Query('staff_member_id', new ValidationPipe({ transform: true })) staff_member_id?: number,
    @Query('approval_id', new ValidationPipe({ transform: true })) approval_id?: number,
    @Query('employee_code', new ValidationPipe({ transform: true })) employee_code?: number,
    @Query('increment_id') increment_id?: string,
    @Query('destination_country') destination_country?: string,
    @Query('is_overdue', new ValidationPipe({ transform: true })) is_overdue?: boolean,
  ) {
    const queryOptions: ApprovalClothingExpenseQueryDto = {
      page,
      limit,
      search,
      order_by,
      direction,
      clothing_file_checked,
      clothing_amount,
      clothing_reason,
      reporting_date,
      next_claim_date,
      work_start_date,
      work_end_date,
      staff_member_id,
      approval_id,
      employee_code,
      increment_id,
      destination_country,
      is_overdue
    };

    return this.approvalClothingExpenseService.findAll(queryOptions);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get approval clothing expense by id' })
  @ApiOkResponse({
    description: 'Approval clothing expense with the specified id',
    schema: {
      example: {
        id: 1,
        clothingFileChecked: true,
        clothingAmount: 1000,
        clothingReason: 'Example reason',
        reportingDate: '2024-01-01',
        nextClaimDate: '2024-02-01',
        workStartDate: '2024-01-01',
        workEndDate: '2024-03-01',
        createdAt: '2024-06-16T00:00:00.000Z',
        updatedAt: '2024-06-16T00:00:00.000Z',
        approvalAccommodationExpenseId: 1,
        staffMemberId: 1,
        approvalId: 1,
        employeeCode: 12345,
        incrementId: 'INC001',
        destinationCountry: 'Thailand',
        // Additional fields from joins
        employeePmtCode: '66019',
        employeeNameTh: 'ชื่อภาษาไทย',
        employeeNameEn: 'English Name',
        employeePosition: 'ตำแหน่งงาน',
        employeeFaculty: 'คณะ/หน่วยงาน',
        employeeEmail: 'email@example.com',
        approvalTravelType: 'domestic',
      },
    },
  })
  async findOne(@Param('id') id: number) {
    return this.approvalClothingExpenseService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create approval clothing expense' })
  @ApiBody({
    type: CreateApprovalClothingExpenseDto,
    examples: {
      example1: {
        value: {
          clothing_file_checked: true,
          clothing_amount: 1000,
          clothing_reason: 'Example reason',
          reporting_date: '2024-01-01',
          next_claim_date: '2024-02-01',
          work_start_date: '2024-01-01',
          work_end_date: '2024-03-01',
          //approval_accommodation_expense_id: 1,
          staff_member_id: 1,
          approval_id: 1,
          employee_code: 12345,
          increment_id: 'INC001',
          destination_country: 'Thailand',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Created approval clothing expense',
    schema: {
      example: {
        id: 1,
        clothingFileChecked: true,
        clothingAmount: 1000,
        clothingReason: 'Example reason',
        reportingDate: '2024-01-01',
        nextClaimDate: '2024-02-01',
        workStartDate: '2024-01-01',
        workEndDate: '2024-03-01',
        createdAt: '2024-06-16T00:00:00.000Z',
        updatedAt: '2024-06-16T00:00:00.000Z',
        approvalAccommodationExpenseId: 1,
        staffMemberId: 1,
        approvalId: 1,
        employeeCode: 12345,
        incrementId: 'INC001',
        destinationCountry: 'Thailand',
      },
    },
  })
  async create(@Body() dto: CreateApprovalClothingExpenseDto) {
    return this.approvalClothingExpenseService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update approval clothing expense' })
  @ApiBody({
    type: UpdateApprovalClothingExpenseDto,
    examples: {
      example1: {
        value: {
          clothing_file_checked: true,
          clothing_amount: 1000,
          clothing_reason: 'Updated reason',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Updated approval clothing expense',
    schema: {
      example: {
        id: 1,
        clothingFileChecked: true,
        clothingAmount: 1000,
        clothingReason: 'Updated reason',
        reportingDate: '2024-01-01',
        nextClaimDate: '2024-02-01',
        workStartDate: '2024-01-01',
        workEndDate: '2024-03-01',
        createdAt: '2024-06-16T00:00:00.000Z',
        updatedAt: '2024-06-16T00:00:00.000Z',
        approvalAccommodationExpenseId: 1,
        staffMemberId: 1,
        approvalId: 1,
        employeeCode: 12345,
        incrementId: 'INC001',
        destinationCountry: 'Thailand',
      },
    },
  })
  async update(
    @Param('id') id: number,
    @Body() dto: UpdateApprovalClothingExpenseDto,
  ) {
    return this.approvalClothingExpenseService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete approval clothing expense' })
  @ApiResponse({ status: 200, description: 'Deleted successfully' })
  async remove(@Param('id') id: number) {
    return this.approvalClothingExpenseService.remove(id);
  }
}
