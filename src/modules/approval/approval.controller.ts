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
import { QueryApprovalDto } from './dto/query-approval.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApprovalQueryOptions } from './interfaces/approval-options.interface';
import { Request } from 'express';
import { User } from '../users/entities/user.entity';
import { ApprovalDetailResponseDto } from './dto/approval-detail-response.dto';
import { UpdateClothingExpenseDatesDto } from './dto/update-clothing-expense-dates.dto';
import { CheckClothingExpenseEligibilityDto } from './dto/check-clothing-expense-eligibility.dto';
import { ClothingExpenseEligibilityResponseDto } from './dto/clothing-expense-eligibility-response.dto';
import { ApprovalStatusLabelResponseDto } from './entities/approval-status-label.entity';
//import { ApprovalWorkLocationDto } from './dto/approval-work-location.dto';

interface RequestWithUser extends Request {
  user: User;
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
  create(@Body() createApprovalDto: CreateApprovalDto, @Req() req: RequestWithUser) {
    return this.approvalService.create(createApprovalDto, req.user.id);
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
    description: 'Filter by approval request start date (วันที่ขออนุมัติเริ่มต้น) - ISO date string (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'approvalRequestEndDate',
    type: String,
    required: false,
    description: 'Filter by approval request end date (วันที่ขออนุมัติสิ้นสุด) - ISO date string (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'isRelatedToMe',
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
  @ApiResponse({ status: 200, description: 'Success' })
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
      includes,
    };

    return this.approvalService.findAll(queryOptions, req.user.id, req.user.employeeCode);
  }

  @Get('status')
  @ApiOperation({
    summary: 'Get approval status labels',
    description: 'Retrieve all approval status labels from the database',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Success',
    type: [ApprovalStatusLabelResponseDto]
  })
  getStatusLabels(): Promise<ApprovalStatusLabelResponseDto[]> {
    return this.approvalService.findAllStatusLabels();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get approval by ID',
    description: 'Retrieve an approval record by its ID with status history',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Success',
    type: ApprovalDetailResponseDto
  })
  findById(@Param('id', ParseIntPipe) id: number): Promise<ApprovalDetailResponseDto> {
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
  ) {
    return this.approvalService.update(id, updateApprovalDto);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Update approval status',
    description: 'Update the status of an approval record',
  })
  @ApiBody({ type: UpdateApprovalStatusDto })
  @ApiResponse({ status: 204, description: 'Approval status updated successfully' })
  @HttpCode(HttpStatus.NO_CONTENT)
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateApprovalStatusDto,
    @Req() req: RequestWithUser,
  ) {
    return this.approvalService.updateStatus(id, updateStatusDto, req.user.id);
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
    description: 'Update reporting date, next claim date, and DD work end date for clothing expense',
  })
  @ApiBody({ type: UpdateClothingExpenseDatesDto })
  @ApiResponse({ status: 204, description: 'Clothing expense dates updated successfully' })
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
    description: 'Check if employees are eligible for clothing expense claim based on next claim date',
  })
  @ApiBody({ type: CheckClothingExpenseEligibilityDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Success',
    type: [ClothingExpenseEligibilityResponseDto]
  })
  checkClothingExpenseEligibility(
    @Body() checkEligibilityDto: CheckClothingExpenseEligibilityDto,
  ): Promise<ClothingExpenseEligibilityResponseDto[]> {
    return this.approvalService.checkClothingExpenseEligibility(checkEligibilityDto);
  }
}
