import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Query,
  ValidationPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ApprovalService } from './approval.service';
import { CreateApprovalDto } from './dto/create-approval.dto';
import { UpdateApprovalDto } from './dto/update-approval.dto';
import { UpdateApprovalStatusDto } from './dto/update-approval-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApprovalQueryOptions } from './interfaces/approval-options.interface';
import { Request } from 'express';
import { User } from '../users/entities/user.entity';
import { ApprovalDetailResponseDto } from './dto/approval-detail-response.dto';
import { UpdateClothingExpenseDatesDto } from './dto/update-clothing-expense-dates.dto';
import { CheckClothingExpenseEligibilityDto } from './dto/check-clothing-expense-eligibility.dto';
import { ClothingExpenseEligibilityResponseDto } from './dto/clothing-expense-eligibility-response.dto';
import { ApprovalStatusLabelResponseDto } from './entities/approval-status-label.entity';
import { UpdateApprovalContinuousDto } from './dto/update-approval-continuous.dto';
import { ApprovalStatisticsResponseDto } from './dto/approval-statistics-response.dto';
import { QueryApprovalsThatHasClothingExpenseDto } from './dto/query-approvals-that-has-clothing-expense';
import { Employee } from '../dataviews/entities/employee.entity';
import { ViewPosition4ot } from '../dataviews/entities/view-position-4ot.entity';
import { OpLevelSalR } from '../dataviews/entities/op-level-sal-r.entity';
//import { ApprovalWorkLocationDto } from './dto/approval-work-location.dto';

interface RequestWithUser extends Request {
  user: User & { employee?: Employee & ViewPosition4ot & OpLevelSalR };
}

@ApiTags('Approvals')
@Controller('approvals')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ApprovalController {
  constructor(private readonly approvalService: ApprovalService) {}

  @Post()
  @ApiOperation({
    summary: 'Create approval',
    description: 'Create a new approval record',
  })
  @ApiBody({ type: CreateApprovalDto })
  @ApiResponse({ status: 201, description: 'Approval created successfully' })
  create(
    @Body() createApprovalDto: CreateApprovalDto,
    @Req() req: RequestWithUser,
  ) {
    if (!req.user.employee) {
      throw new Error('Employee data not found for user');
    }
    return this.approvalService.create(
      createApprovalDto, 
      req.user.employee.code,
      req.user.employee.name,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'Get all approvals',
    description: 'Retrieve all approval records with pagination and filtering',
  })
  @ApiQuery({
    name: 'page',
    type: Number,
    required: false,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    description: 'Number of items per page',
  })
  @ApiQuery({
    name: 'orderBy',
    type: String,
    required: false,
    description: 'Field to order by',
  })
  @ApiQuery({
    name: 'orderDir',
    type: String,
    required: false,
    description: 'Order direction',
    enum: ['ASC', 'DESC'],
  })
  @ApiQuery({
    name: 'includeInactive',
    type: Boolean,
    required: false,
    description: 'Include inactive approvals',
  })
  @ApiQuery({
    name: 'name',
    type: String,
    required: false,
    description: 'Filter by name',
  })
  @ApiQuery({
    name: 'searchTerm',
    type: String,
    required: false,
    description: 'Search term',
  })
  @ApiQuery({
    name: 'latestApprovalStatus',
    type: String,
    required: false,
    description: 'Filter by latest approval status',
  })
  @ApiQuery({
    name: 'incrementId',
    type: String,
    required: false,
    description: 'Filter by increment ID (เลขที่หนังสือ)',
  })
  @ApiQuery({
    name: 'urgencyLevel',
    type: String,
    required: false,
    description: 'Filter by urgency level (ความด่วน)',
  })
  @ApiQuery({
    name: 'confidentialityLevel',
    type: String,
    required: false,
    description: 'Filter by confidentiality level (ความลับ)',
  })
  @ApiQuery({
    name: 'documentTitle',
    type: String,
    required: false,
    description: 'Filter by document title (เรื่อง)',
  })
  @ApiQuery({
    name: 'approvalRequestStartDate',
    type: String,
    required: false,
    description:
      'Filter by approval request start date (วันที่ขออนุมัติเริ่มต้น) - ISO date string (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'approvalRequestEndDate',
    type: String,
    required: false,
    description:
      'Filter by approval request end date (วันที่ขออนุมัติสิ้นสุด) - ISO date string (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'isRelatedToMe',
    type: Boolean,
    required: false,
    description: 'Filter by whether the approval is related to the user',
  })
  @ApiQuery({
    name: 'isMyApproval',
    type: Boolean,
    required: false,
    description: 'Filter by whether the approval is related to the user',
  })
  @ApiQuery({
    name: 'includes',
    type: [String],
    required: false,
    description: 'Relations to include',
  })
  @ApiResponse({
    status: 200,
    description: 'Success',
    schema: {
      example: {
        data: [
          {
            id: 1,
            incrementId: '67001',
            approvalRef: null,
            recordType: 'owner',
            name: 'นายสมชาย สมหญิง',
            employeeCode: '66019',
            travelType: 'domestic',
            internationalSubOption: null,
            workStartDate: '2024-03-20',
            workEndDate: '2024-03-25',
            startCountry: 'Thailand',
            endCountry: 'Japan',
            remarks: 'Business trip for annual meeting',
            numTravelers: 'single',
            documentNo: 'DOC-2024-001',
            documentTel: '0812345678',
            documentTo: 'HR Department',
            documentTitle: 'Business Trip Request',
            attachmentId: 1,
            form3TotalOutbound: 5000,
            form3TotalInbound: 3000,
            form3TotalAmount: 8000,
            exceedLodgingRightsChecked: false,
            exceedLodgingRightsReason: null,
            form4TotalAmount: 5000,
            form5TotalAmount: 3000,
            createdAt: '2024-06-21T10:00:00.000Z',
            updatedAt: '2024-06-21T10:00:00.000Z',
            attachments: [
              {
                id: 1,
                entityType: 'approval_document',
                entityId: 1,
                fileId: 1,
                fileName: 'document.pdf',
                originalName: 'document.pdf',
                mimeType: 'application/pdf',
                size: 1024000,
                path: '/uploads/documents/document.pdf',
                createdAt: '2024-06-21T10:00:00.000Z',
                updatedAt: '2024-06-21T10:00:00.000Z',
              },
              {
                id: 2,
                entityType: 'approval_signature',
                entityId: 1,
                fileId: 2,
                fileName: 'signature.png',
                originalName: 'signature.png',
                mimeType: 'image/png',
                size: 512000,
                path: '/uploads/signatures/signature.png',
                createdAt: '2024-06-21T10:00:00.000Z',
                updatedAt: '2024-06-21T10:00:00.000Z',
              },
            ],
          },
        ],
        meta: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      },
    },
  })
  findAll(
    @Req() req: RequestWithUser,
    @Query('page', new ValidationPipe({ transform: true })) page?: number,
    @Query('limit', new ValidationPipe({ transform: true })) limit?: number,
    @Query('orderBy') orderBy?: string,
    @Query('orderDir') orderDir?: 'ASC' | 'DESC',
    @Query('includeInactive') includeInactive?: boolean,
    @Query('name') name?: string,
    @Query('searchTerm') searchTerm?: string,
    @Query('latestApprovalStatus') latestApprovalStatus?: string,
    @Query('incrementId') incrementId?: string,
    @Query('urgencyLevel') urgencyLevel?: string,
    @Query('confidentialityLevel') confidentialityLevel?: string,
    @Query('documentTitle') documentTitle?: string,
    @Query('approvalRequestStartDate') approvalRequestStartDate?: string,
    @Query('approvalRequestEndDate') approvalRequestEndDate?: string,
    @Query('isRelatedToMe') isRelatedToMe?: boolean,
    @Query('isMyApproval') isMyApproval?: boolean,
    @Query('includes') includes?: string[],
  ) {
    const queryOptions: ApprovalQueryOptions = {
      page,
      limit,
      orderBy,
      orderDir,
      includeInactive,
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
      includes,
    };

    if (!req.user.employee) {
      throw new Error('Employee data not found for user');
    }
    return this.approvalService.findAll(
      queryOptions,
      req.user.employee.code,
    );
  }

  @Get('status')
  @ApiOperation({
    summary: 'Get approval status labels',
    description: 'Retrieve all approval status labels from the database',
  })
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: [ApprovalStatusLabelResponseDto],
  })
  getStatusLabels(): Promise<ApprovalStatusLabelResponseDto[]> {
    return this.approvalService.findAllStatusLabels();
  }

  @Get('statistics')
  @ApiOperation({
    summary: 'Get approval statistics',
    description:
      'Retrieve approval statistics for dashboard with counts by status and travel type',
  })
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: ApprovalStatisticsResponseDto,
  })
  getStatistics(
    @Req() req: RequestWithUser,
  ): Promise<ApprovalStatisticsResponseDto> {
    if (!req.user.employee) {
      throw new Error('Employee data not found for user');
    }
    return this.approvalService.getStatistics(req.user.employee.code);
  }

  @Get('approvals-that-has-clothing-expense')
  @ApiOperation({
    summary: 'Get approvals that has clothing expense',
    description: 'Get approvals that has clothing expense',
  })
  @ApiQuery({
    name: 'documentTitle',
    type: String,
    required: false,
    description: 'Filter by document title (เรื่อง)',
  })
  @ApiQuery({
    name: 'approvalRequestStartDate',
    type: String,
    required: false,
    description:
      'Filter by approval request start date (วันที่ขออนุมัติเริ่มต้น) - ISO date string (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'approvalRequestEndDate',
    type: String,
    required: false,
    description:
      'Filter by approval request end date (วันที่ขออนุมัติสิ้นสุด) - ISO date string (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'incrementId',
    type: String,
    required: false,
    description: 'Filter by increment ID (เลขที่หนังสือ)',
  })
  @ApiQuery({
    name: 'urgencyLevel',
    type: String,
    required: false,
    description: 'Filter by urgency level (ความด่วน)',
  })
  @ApiQuery({
    name: 'confidentialityLevel',
    type: String,
    required: false,
    description: 'Filter by confidentiality level (ความลับ)',
  })
  @ApiQuery({
    name: 'creatorCode',
    type: String,
    required: false,
    description: 'Filter by creator code',
  })
  @ApiResponse({ status: 200, description: 'Success' })
  getApprovalsThatHasClothingExpense(
    @Query() query: QueryApprovalsThatHasClothingExpenseDto,
  ) {
    return this.approvalService.getApprovalThatHasClothingExpense(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get approval by ID',
    description: 'Retrieve an approval record by its ID with status history',
  })
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: ApprovalDetailResponseDto,
  })
  findById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApprovalDetailResponseDto> {
    return this.approvalService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update approval',
    description: 'Update an existing approval record',
  })
  @ApiBody({ type: UpdateApprovalDto })
  @ApiResponse({ status: 200, description: 'Approval updated successfully' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateApprovalDto: UpdateApprovalDto,
    @Req() req: RequestWithUser,
  ) {
    if (!req.user.employee) {
      throw new Error('Employee data not found for user');
    }
    return this.approvalService.update(
      id,
      updateApprovalDto,
      req.user.employee.code,
    );
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Update approval status',
    description: 'Update the status of an approval record',
  })
  @ApiBody({ type: UpdateApprovalStatusDto })
  @ApiResponse({
    status: 204,
    description: 'Approval status updated successfully',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateApprovalStatusDto,
    @Req() req: RequestWithUser,
  ) {
    if (!req.user.employee) {
      throw new Error('Employee data not found for user');
    }
    return this.approvalService.updateStatus(id, updateStatusDto, req.user.employee.code);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete approval',
    description: 'Soft delete an approval record',
  })
  @ApiResponse({ status: 204, description: 'Approval deleted successfully' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.approvalService.remove(id);
  }

  @Patch(':id/clothing-expense-dates')
  @ApiOperation({
    summary: 'Update clothing expense dates',
    description:
      'Update reporting date, next claim date, and DD work end date for clothing expense',
  })
  @ApiBody({ type: UpdateClothingExpenseDatesDto })
  @ApiResponse({
    status: 204,
    description: 'Clothing expense dates updated successfully',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  updateClothingExpenseDates(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDatesDto: UpdateClothingExpenseDatesDto,
  ) {
    return this.approvalService.updateClothingExpenseDates(id, updateDatesDto);
  }

  @Post('check-clothing-expense-eligibility')
  @ApiOperation({
    summary: 'Check clothing expense eligibility',
    description:
      'Check if employees are eligible for clothing expense claim based on next claim date',
  })
  @ApiBody({ type: CheckClothingExpenseEligibilityDto })
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: [ClothingExpenseEligibilityResponseDto],
  })
  checkClothingExpenseEligibility(
    @Body() checkEligibilityDto: CheckClothingExpenseEligibilityDto,
  ): Promise<ClothingExpenseEligibilityResponseDto[]> {
    return this.approvalService.checkClothingExpenseEligibility(
      checkEligibilityDto,
    );
  }

  @Post('approvals-continuous/:id')
  @ApiOperation({
    summary: 'Update approval continuous',
    description: 'Update approval continuous by ID',
  })
  @ApiBody({ type: UpdateApprovalContinuousDto })
  @ApiResponse({
    status: 200,
    description: 'Approval continuous updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Approval continuous not found' })
  updateApprovalContinuous(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateApprovalContinuousDto,
    @Req() req: RequestWithUser,
  ) {
    if (!req.user.employee) {
      throw new Error('Employee data not found for user');
    }
    return this.approvalService.updateApprovalContinuous(
      id,
      updateDto,
      req.user.employee.code,
    );
  }

  @Post('duplicate/:id')
  @ApiOperation({
    summary: 'Duplicate approval',
    description: 'Create a duplicate of an existing approval record',
  })
  @ApiResponse({ status: 201, description: 'Approval duplicated successfully' })
  @ApiResponse({ status: 404, description: 'Approval not found' })
  duplicate(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestWithUser,
  ) {
    if (!req.user.employee) {
      throw new Error('Employee data not found for user');
    }
    return this.approvalService.duplicate(
      id,
      req.user.employee.code,
      req.user.employee.name,
    );
  }
}
