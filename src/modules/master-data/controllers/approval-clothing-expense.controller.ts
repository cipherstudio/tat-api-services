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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
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
        ],
        meta: { total: 1, page: 1, limit: 10, lastPage: 1 },
      },
    },
  })
  async findAll(@Query() query: ApprovalClothingExpenseQueryDto) {
    return this.approvalClothingExpenseService.findAll(query);
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
          work_end_date: '2024-03-01',
          approval_accommodation_expense_id: 1,
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
