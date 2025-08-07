import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersReportsService } from '../services/users-reports.service';
import { CommuteQueryDto } from '../dto/commute-query.dto';
import { WorkQueryDto } from '../dto/work-query.dto';
import { ExpenditureQueryDto } from '../dto/expenditure-query.dto';
import { ClothingQueryDto } from '../dto/clothing-query.dto';
import { ActivityQueryDto } from '../dto/activity-query.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('Users Reports')
@Controller('users-reports')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class UsersReportsController {
  constructor(private readonly usersReportsService: UsersReportsService) {}

  @Get('commute')
  @ApiOperation({ summary: 'รายงานการเดินทาง' })
  @ApiOkResponse({ description: 'รายงานการเดินทางสำเร็จ' })
  @ApiQuery({ name: 'page', type: Number, required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', type: Number, required: false, description: 'Number of items per page' })
  @ApiQuery({ name: 'orderBy', type: String, required: false, description: 'Field to order by' })
  @ApiQuery({ name: 'orderDir', type: String, required: false, description: 'Order direction (ASC/DESC)' })
  @ApiQuery({ name: 'incrementId', required: false, description: 'รหัสหนังสือขออนุมัติเดินทาง' })
  @ApiQuery({ name: 'approvalStatus', required: false, description: 'สถานะการอนุมัติ (DRAFT, PENDING, APPROVED, REJECTED)' })
  @ApiQuery({ name: 'documentTitle', required: false, description: 'เรื่องขออนุมัติเดินทาง' })
  @ApiQuery({ name: 'approvalDateStart', required: false, description: 'วันที่เดินทางตั้งแต่' })
  @ApiQuery({ name: 'approvalDateEnd', required: false, description: 'วันที่เดินทางถึง' })
  @ApiQuery({ name: 'travelType', required: false, description: 'ประเภทการเดินทาง' })
  async getCommuteReport(@Query() query: CommuteQueryDto) {
    const queryOptions = {
      page: query.page || 1,
      limit: query.limit || 10,
      orderBy: query.orderBy || 'created_at',
      orderDir: query.orderDir || 'DESC',
      ...query,
    };
    return this.usersReportsService.getCommuteReport(queryOptions);
  }

  @Get('work')
  @ApiOperation({ summary: 'รายงานการจัดทำรายงานปฏิบัติงาน' })
  @ApiOkResponse({ description: 'รายงานการจัดทำรายงานปฏิบัติงานสำเร็จ' })
  @ApiQuery({ name: 'page', type: Number, required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', type: Number, required: false, description: 'Number of items per page' })
  @ApiQuery({ name: 'orderBy', type: String, required: false, description: 'Field to order by' })
  @ApiQuery({ name: 'orderDir', type: String, required: false, description: 'Order direction (ASC/DESC)' })
  @ApiQuery({ name: 'documentNumber', required: false, description: 'หมายเลขเอกสาร' })
  @ApiQuery({ name: 'title', required: false, description: 'ชื่อเอกสาร' })
  @ApiQuery({ name: 'creatorName', required: false, description: 'ผู้จัดทำรายงาน' })
  @ApiQuery({ name: 'startDate', required: false, description: 'วันที่สร้างเอกสารตั้งแต่' })
  @ApiQuery({ name: 'endDate', required: false, description: 'วันที่สร้างเอกสารถึง' })
  async getWorkReport(@Query() query: WorkQueryDto) {
    const queryOptions = {
      page: query.page || 1,
      limit: query.limit || 10,
      orderBy: query.orderBy || 'created_at',
      orderDir: query.orderDir || 'DESC',
      ...query,
    };
    return this.usersReportsService.getWorkReport(queryOptions);
  }

  @Get('expenditure')
  @ApiOperation({ summary: 'รายงานการใช้งบประมาณ' })
  @ApiOkResponse({ description: 'รายงานการใช้งบประมาณสำเร็จ' })
  @ApiQuery({ name: 'page', type: Number, required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', type: Number, required: false, description: 'Number of items per page' })
  @ApiQuery({ name: 'orderBy', type: String, required: false, description: 'Field to order by' })
  @ApiQuery({ name: 'orderDir', type: String, required: false, description: 'Order direction (ASC/DESC)' })
  @ApiQuery({ name: 'startDate', required: false, description: 'วันที่อนุมัติตั้งแต่' })
  @ApiQuery({ name: 'endDate', required: false, description: 'วันที่อนุมัติถึง' })
  @ApiQuery({ name: 'userId', required: false, description: 'รหัสผู้ตั้งเรื่องอนุมัติ' })
  @ApiQuery({ name: 'budgetType', required: false, description: 'ประเภทงบประมาณ (จาก approval_budgets.budget_type)' })
  @ApiQuery({ name: 'travelType', required: false, description: 'ประเภทรายการ (จาก approval_budgets.item_type)' })
  @ApiQuery({ name: 'minAmount', required: false, description: 'จำนวนเงินขั้นต่ำ' })
  @ApiQuery({ name: 'maxAmount', required: false, description: 'จำนวนเงินสูงสุด' })
  async getExpenditureReport(@Query() query: ExpenditureQueryDto) {
    const queryOptions = {
      page: query.page || 1,
      limit: query.limit || 10,
      orderBy: query.orderBy || 'approval_budgets.created_at',
      orderDir: query.orderDir || 'DESC',
      ...query,
    };
    return this.usersReportsService.getExpenditureReport(queryOptions);
  }

  @Get('clothing')
  @ApiOperation({ summary: 'รายงานประวัติการเบิกค่าเครื่องแต่งกาย' })
  @ApiOkResponse({ description: 'รายงานประวัติการเบิกค่าเครื่องแต่งกายสำเร็จ' })
  @ApiQuery({ name: 'page', type: Number, required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', type: Number, required: false, description: 'Number of items per page' })
  @ApiQuery({ name: 'orderBy', type: String, required: false, description: 'Field to order by' })
  @ApiQuery({ name: 'orderDir', type: String, required: false, description: 'Order direction (ASC/DESC)' })
  @ApiQuery({ name: 'startDate', required: false, description: 'วันที่เริ่มต้น' })
  @ApiQuery({ name: 'endDate', required: false, description: 'วันที่สิ้นสุด' })
  @ApiQuery({ name: 'employeeName', required: false, description: 'ชื่อพนักงาน' })
  async getClothingReport(@Query() query: ClothingQueryDto) {
    const queryOptions = {
      page: query.page || 1,
      limit: query.limit || 10,
      orderBy: query.orderBy || 'created_at',
      orderDir: query.orderDir || 'DESC',
      ...query,
    };
    return this.usersReportsService.getClothingReport(queryOptions);
  }

  @Get('activity')
  @ApiOperation({ summary: 'รายงานประวัติการเข้าใช้งานระบบ' })
  @ApiOkResponse({ description: 'รายงานประวัติการเข้าใช้งานระบบสำเร็จ' })
  @ApiQuery({ name: 'page', type: Number, required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', type: Number, required: false, description: 'Number of items per page' })
  @ApiQuery({ name: 'orderBy', type: String, required: false, description: 'Field to order by' })
  @ApiQuery({ name: 'orderDir', type: String, required: false, description: 'Order direction (ASC/DESC)' })
  @ApiQuery({ name: 'startDate', required: false, description: 'วันที่เริ่มต้น' })
  @ApiQuery({ name: 'endDate', required: false, description: 'วันที่สิ้นสุด' })
  @ApiQuery({ name: 'employeeName', required: false, description: 'ชื่อ-สกุล' })
  async getActivityReport(@Query() query: ActivityQueryDto) {
    const queryOptions = {
      page: query.page || 1,
      limit: query.limit || 10,
      orderBy: query.orderBy || 'created_at',
      orderDir: query.orderDir || 'DESC',
      ...query,
    };
    return this.usersReportsService.getActivityReport(queryOptions);
  }


} 