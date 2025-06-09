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
  @ApiResponse({ status: 200, description: 'Success' })
  findAll(
    @Query('page', new ValidationPipe({ transform: true })) page?: number,
    @Query('limit', new ValidationPipe({ transform: true })) limit?: number,
    @Query('orderBy') orderBy?: string,
    @Query('orderDir') orderDir?: 'ASC' | 'DESC',
    @Query('includeInactive') includeInactive?: boolean,
    @Query('name') name?: string,
    @Query('isActive') isActive?: boolean,
    @Query('searchTerm') searchTerm?: string,
    @Query('createdAfter') createdAfter?: Date,
    @Query('createdBefore') createdBefore?: Date,
    @Query('includes') includes?: string[],
  ) {
    const queryOptions: ApprovalQueryOptions = {
      page,
      limit,
      orderBy,
      orderDir,
      includeInactive,
      name,
      isActive,
      searchTerm,
      createdAfter,
      createdBefore,
      includes,
    };

    return this.approvalService.findAll(queryOptions);
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
