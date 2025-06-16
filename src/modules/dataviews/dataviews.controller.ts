import {
  Controller,
  Get,
  Param,
  UseGuards,
  Query,
  Version,
} from '@nestjs/common';
import { DataviewsService } from './dataviews.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { QueryEmployeeDto } from './dto/query-employee.dto';
import { QueryAbDeputyDto } from './dto/query-ab-deputy.dto';
import { QueryAbHolidayDto } from './dto/query-ab-holiday.dto';
import { QueryOpChildrenTDto } from './dto/query-op-children-t.dto';
import { QueryOpHeadTDto } from './dto/query-op-head-t.dto';
import { QueryOpMasterTDto } from './dto/query-op-master-t.dto';
import { QueryOpOrganizeRDto } from './dto/query-op-organize-r.dto';
import { QueryOpPositionNoTDto } from './dto/query-op-position-no-t.dto';
import { QueryOpPosExecutiveRDto } from './dto/query-op-pos-executive-r.dto';
import { QueryViewPosition4otDto } from './dto/query-view-position-4ot.dto';
import { QueryVBudgetCodeDto } from './dto/query-v-budget-code.dto';
import { QueryVTxOtDto } from './dto/query-v-tx-ot.dto';
import { QueryPsPwJobDto } from './dto/query-ps-pw-job.dto';
import { QueryOpLevelSalRDto } from './dto/query-op-level-sal-r.dto';
import { OpLevelSalR } from './entities/op-level-sal-r.entity';
import {
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { EmployeePaginate } from './entities/employee.entity';
import { AbDeputyPaginate } from './entities/ab-deputy.entity';
import { AbHolidayPaginate } from './entities/ab-holiday.entity';
import { OpChildrenTPaginate } from './entities/op-children-t.entity';
import { OpHeadTPaginate } from './entities/op-head-t.entity';
import { OpMasterTPaginate } from './entities/op-master-t.entity';
import { OpOrganizeRPaginate } from './entities/op-organize-r.entity';
import { OpPositionNoTPaginate } from './entities/op-position-no-t.entity';
import { OpPosExecutiveRPaginate } from './entities/op-pos-executive-r.entity';
import { ViewPosition4otPaginate } from './entities/view-position-4ot.entity';
import { VBudgetCodePaginate } from './entities/v-budget-code.entity';
import { VTxOtPaginate } from './entities/v-tx-ot.entity';
import { PsPwJobPaginate } from './entities/ps-pw-job.entity';
import { OpLevelSalRRepository, OpLevelSalRPaginate } from './repositories/op-level-sal-r.repository';

@ApiTags('dataviews')
@Controller('dataviews')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class DataviewsController {
  constructor(private readonly dataviewsService: DataviewsService) {}

  @Version('1')
  @Get('employees')
  @ApiOperation({
    summary: 'ค้นหาข้อมูลพนักงานด้วยเงื่อนไข (Query EMPLOYEE view)',
    description:
      'สามารถกรองข้อมูลพนักงานตาม code, name, sex, province, department, position, minSalary, maxSalary ได้',
  })
  @ApiQuery({ name: 'code', required: false, description: 'รหัสพนักงาน' })
  @ApiQuery({ name: 'name', required: false, description: 'ชื่อพนักงาน' })
  @ApiQuery({
    name: 'searchTerm',
    required: false,
    description: 'ค้นหาจากชื่อพนักงาน (LIKE query)',
  })
  @ApiQuery({ name: 'sex', required: false, description: 'เพศ' })
  @ApiQuery({ name: 'province', required: false, description: 'จังหวัด' })
  @ApiQuery({ name: 'department', required: false, description: 'แผนก' })
  @ApiQuery({ name: 'position', required: false, description: 'ตำแหน่ง' })
  @ApiQuery({
    name: 'minSalary',
    required: false,
    description: 'ช่วงเงินเดือนขั้นต่ำ',
    type: Number,
  })
  @ApiQuery({
    name: 'maxSalary',
    required: false,
    description: 'ช่วงเงินเดือนสูงสุด',
    type: Number,
  })
  findEmployeesWithQuery(
    @Query() query: QueryEmployeeDto,
  ): Promise<EmployeePaginate> {
    return this.dataviewsService.findEmployeesWithQuery(query);
  }

  @Version('1')
  @Get('employees/:code')
  @ApiOperation({
    summary: 'ดึงข้อมูลพนักงานรายคน (Query EMPLOYEE view by code)',
    description: 'ดึงข้อมูลพนักงานจาก view EMPLOYEE ตามรหัสพนักงาน (code)',
  })
  @ApiParam({ name: 'code', description: 'รหัสพนักงาน', required: true })
  findEmployeeByCode(@Param('code') code: string) {
    return this.dataviewsService.findEmployeeByCode(code);
  }

  @Version('1')
  @Get('ab-deputies')
  @ApiOperation({
    summary: 'ค้นหาข้อมูล AB_DEPUTY ด้วยเงื่อนไข',
    description:
      'สามารถกรองข้อมูล AB_DEPUTY ตาม gdpId, pmtCode, pogCode, gdpDeputyStatus, limit, offset ได้',
  })
  @ApiQuery({
    name: 'gdpId',
    required: false,
    description: 'GDP_ID',
    type: Number,
  })
  @ApiQuery({
    name: 'pmtCode',
    required: false,
    description: 'PMT_CODE',
    type: Number,
  })
  @ApiQuery({ name: 'pogCode', required: false, description: 'POG_CODE' })
  @ApiQuery({
    name: 'gdpDeputyStatus',
    required: false,
    description: 'GDP_DEPUTY_STATUS',
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'จำนวนรายการต่อหน้า',
    type: Number,
    example: 10,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description: 'ข้ามกี่รายการ',
    type: Number,
    example: 0,
  })
  findAbDeputiesWithQuery(
    @Query() query: QueryAbDeputyDto,
  ): Promise<AbDeputyPaginate> {
    return this.dataviewsService.findAbDeputiesWithQuery(query);
  }

  @Version('1')
  @Get('ab-holiday')
  @ApiOperation({
    summary: 'ค้นหาข้อมูล AB_HOLIDAY ด้วยเงื่อนไข',
    description:
      'สามารถกรองข้อมูล AB_HOLIDAY ตาม holidayDate, pogCode, limit, offset ได้',
  })
  @ApiQuery({
    name: 'holidayDate',
    required: false,
    description: 'HOLIDAY_DATE',
    type: String,
    format: 'date-time',
  })
  @ApiQuery({ name: 'pogCode', required: false, description: 'POG_CODE' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'จำนวนรายการต่อหน้า',
    type: Number,
    example: 10,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description: 'ข้ามกี่รายการ',
    type: Number,
    example: 0,
  })
  findAbHolidayWithQuery(
    @Query() query: QueryAbHolidayDto,
  ): Promise<AbHolidayPaginate> {
    return this.dataviewsService.findAbHolidayWithQuery(query);
  }

  @Version('1')
  @Get('ab-holiday/current-year')
  @ApiOperation({
    summary: 'ดึงข้อมูลวันหยุดประจำปีปัจจุบัน',
    description:
      'ดึงข้อมูลวันหยุดทั้งหมดของปีปัจจุบัน (Current Year) จาก view AB_HOLIDAY',
  })
  findAbHolidayCurrentYear() {
    return this.dataviewsService.findAbHolidayCurrentYear();
  }

  @Version('1')
  @Get('op-children-t')
  @ApiOperation({
    summary: 'ค้นหาข้อมูล OP_CHILDREN_T ด้วยเงื่อนไข',
    description:
      'สามารถกรองข้อมูล OP_CHILDREN_T ตาม pchCode, pchName, limit, offset ได้',
  })
  @ApiQuery({ name: 'pchCode', required: false, description: 'PCH_CODE' })
  @ApiQuery({ name: 'pchName', required: false, description: 'PCH_NAME' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'จำนวนรายการต่อหน้า',
    type: Number,
    example: 10,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description: 'ข้ามกี่รายการ',
    type: Number,
    example: 0,
  })
  findOpChildrenTWithQuery(
    @Query() query: QueryOpChildrenTDto,
  ): Promise<OpChildrenTPaginate> {
    return this.dataviewsService.findOpChildrenTWithQuery(query);
  }

  @Version('1')
  @Get('op-head-t')
  @ApiOperation({
    summary: 'ค้นหาข้อมูล OP_HEAD_T ด้วยเงื่อนไข',
    description:
      'สามารถกรองข้อมูล OP_HEAD_T ตาม phtCode, phtNameT, limit, offset ได้',
  })
  @ApiQuery({ name: 'phtCode', required: false, description: 'PHT_CODE' })
  @ApiQuery({ name: 'phtNameT', required: false, description: 'PHT_NAME_T' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'จำนวนรายการต่อหน้า',
    type: Number,
    example: 10,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description: 'ข้ามกี่รายการ',
    type: Number,
    example: 0,
  })
  findOpHeadTWithQuery(
    @Query() query: QueryOpHeadTDto,
  ): Promise<OpHeadTPaginate> {
    return this.dataviewsService.findOpHeadTWithQuery(query);
  }

  @Version('1')
  @Get('op-master-t')
  @ApiOperation({
    summary: 'ค้นหาข้อมูล OP_MASTER_T ด้วยเงื่อนไข',
    description:
      'สามารถกรองข้อมูล OP_MASTER_T ตาม pmtCode, pmtNameT, limit, offset ได้',
  })
  @ApiQuery({ name: 'pmtCode', required: false, description: 'PMT_CODE' })
  @ApiQuery({ name: 'pmtNameT', required: false, description: 'PMT_NAME_T' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'จำนวนรายการต่อหน้า',
    type: Number,
    example: 10,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description: 'ข้ามกี่รายการ',
    type: Number,
    example: 0,
  })
  findOpMasterTWithQuery(
    @Query() query: QueryOpMasterTDto,
  ): Promise<OpMasterTPaginate> {
    return this.dataviewsService.findOpMasterTWithQuery(query);
  }

  @Version('1')
  @Get('op-organize-r')
  @ApiOperation({
    summary: 'ค้นหาข้อมูล OP_ORGANIZE_R ด้วยเงื่อนไข',
    description:
      'สามารถกรองข้อมูล OP_ORGANIZE_R ตาม pogCode, pogDesc, limit, offset ได้',
  })
  @ApiQuery({ name: 'pogCode', required: false, description: 'POG_CODE' })
  @ApiQuery({ name: 'pogDesc', required: false, description: 'POG_DESC' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'จำนวนรายการต่อหน้า',
    type: Number,
    example: 10,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description: 'ข้ามกี่รายการ',
    type: Number,
    example: 0,
  })
  findOpOrganizeRWithQuery(
    @Query() query: QueryOpOrganizeRDto,
  ): Promise<OpOrganizeRPaginate> {
    return this.dataviewsService.findOpOrganizeRWithQuery(query);
  }

  @Version('1')
  @Get('op-position-no-t')
  @ApiOperation({
    summary: 'ค้นหาข้อมูล OP_POSITION_NO_T ด้วยเงื่อนไข',
    description:
      'สามารถกรองข้อมูล OP_POSITION_NO_T ตาม ppnNumber, ppnOrganize, limit, offset ได้',
  })
  @ApiQuery({ name: 'ppnNumber', required: false, description: 'PPN_NUMBER' })
  @ApiQuery({
    name: 'ppnOrganize',
    required: false,
    description: 'PPN_ORGANIZE',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'จำนวนรายการต่อหน้า',
    type: Number,
    example: 10,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description: 'ข้ามกี่รายการ',
    type: Number,
    example: 0,
  })
  findOpPositionNoTWithQuery(
    @Query() query: QueryOpPositionNoTDto,
  ): Promise<OpPositionNoTPaginate> {
    return this.dataviewsService.findOpPositionNoTWithQuery(query);
  }

  @Version('1')
  @Get('op-pos-executive-r')
  @ApiOperation({
    summary: 'ค้นหาข้อมูล OP_POS_EXECUTIVE_R ด้วยเงื่อนไข',
    description:
      'สามารถกรองข้อมูล OP_POS_EXECUTIVE_R ตาม ppeCode, ppeDescT, limit, offset ได้',
  })
  @ApiQuery({ name: 'ppeCode', required: false, description: 'PPE_CODE' })
  @ApiQuery({ name: 'ppeDescT', required: false, description: 'PPE_DESC_T' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'จำนวนรายการต่อหน้า',
    type: Number,
    example: 10,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description: 'ข้ามกี่รายการ',
    type: Number,
    example: 0,
  })
  findOpPosExecutiveRWithQuery(
    @Query() query: QueryOpPosExecutiveRDto,
  ): Promise<OpPosExecutiveRPaginate> {
    return this.dataviewsService.findOpPosExecutiveRWithQuery(query);
  }

  @Version('1')
  @Get('view-position-4ot')
  @ApiOperation({
    summary: 'ค้นหาข้อมูล VIEW_POSITION_4OT ด้วยเงื่อนไข',
    description:
      'สามารถกรองข้อมูล VIEW_POSITION_4OT ตาม posPositioncode, posPositionname, posDeptId, limit, offset ได้',
  })
  @ApiQuery({
    name: 'posPositioncode',
    required: false,
    description: 'POS_POSITIONCODE',
  })
  @ApiQuery({
    name: 'posPositionname',
    required: false,
    description: 'POS_POSITIONNAME',
  })
  @ApiQuery({ name: 'posDeptId', required: false, description: 'POS_DEPT_ID' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'จำนวนรายการต่อหน้า',
    type: Number,
    example: 10,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description: 'ข้ามกี่รายการ',
    type: Number,
    example: 0,
  })
  findViewPosition4otWithQuery(
    @Query() query: QueryViewPosition4otDto,
  ): Promise<ViewPosition4otPaginate> {
    return this.dataviewsService.findViewPosition4otWithQuery(query);
  }

  @Version('1')
  @Get('v-budget-code')
  @ApiOperation({
    summary: 'ค้นหาข้อมูล V_BUDGET_CODE ด้วยเงื่อนไข',
    description:
      'สามารถกรองข้อมูล V_BUDGET_CODE ตาม budgetCode, typeBudget, typeCalendar, limit, offset ได้',
  })
  @ApiQuery({ name: 'budgetCode', required: false, description: 'BUDGET_CODE' })
  @ApiQuery({ name: 'typeBudget', required: false, description: 'TYPE_BUDGET' })
  @ApiQuery({
    name: 'typeCalendar',
    required: false,
    description: 'TYPE_CALENDAR',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'จำนวนรายการต่อหน้า',
    type: Number,
    example: 10,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description: 'ข้ามกี่รายการ',
    type: Number,
    example: 0,
  })
  findVBudgetCodeWithQuery(
    @Query() query: QueryVBudgetCodeDto,
  ): Promise<VBudgetCodePaginate> {
    return this.dataviewsService.findVBudgetCodeWithQuery(query);
  }

  @Version('1')
  @Get('v-tx-ot')
  @ApiOperation({
    summary: 'ค้นหาข้อมูล V_TX_OT ด้วยเงื่อนไข',
    description:
      'สามารถกรองข้อมูล V_TX_OT ตาม budYear, sectionCode, sectionName, activitySubDesc, budgetCode, limit, offset ได้',
  })
  @ApiQuery({ name: 'budYear', required: false, description: 'BUD_YEAR' })
  @ApiQuery({
    name: 'sectionCode',
    required: false,
    description: 'SECTION_CODE',
  })
  @ApiQuery({
    name: 'sectionName',
    required: false,
    description: 'SECTION_NAME',
  })
  @ApiQuery({
    name: 'activitySubDesc',
    required: false,
    description: 'ACTIVITY_SUB_DESC',
  })
  @ApiQuery({ name: 'budgetCode', required: false, description: 'BUDGET_CODE' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'จำนวนรายการต่อหน้า',
    type: Number,
    example: 10,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description: 'ข้ามกี่รายการ',
    type: Number,
    example: 0,
  })
  findVTxOtWithQuery(@Query() query: QueryVTxOtDto): Promise<VTxOtPaginate> {
    return this.dataviewsService.findVTxOtWithQuery(query);
  }

  @Version('1')
  @Get('ps-pw-job')
  @ApiOperation({
    summary: 'ค้นหาข้อมูล PS_PW_JOB (วิวตำแหน่งงานบุคลากร)',
    description:
      'ค้นหาข้อมูลจากวิว PS_PW_JOB สามารถกรองตาม emplid (รหัสพนักงาน), deptid (รหัสแผนก), positionNbr (รหัสตำแหน่ง) และรองรับการแบ่งหน้า',
  })
  @ApiQuery({ name: 'emplid', required: false, description: 'รหัสพนักงาน' })
  @ApiQuery({ name: 'deptid', required: false, description: 'รหัสแผนก' })
  @ApiQuery({
    name: 'positionNbr',
    required: false,
    description: 'รหัสตำแหน่ง',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'จำนวนรายการต่อหน้า',
    type: Number,
    example: 10,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description: 'ข้ามกี่รายการ',
    type: Number,
    example: 0,
  })
  findPsPwJobWithQuery(
    @Query() query: QueryPsPwJobDto,
  ): Promise<PsPwJobPaginate> {
    return this.dataviewsService.findPsPwJobWithQuery(query);
  }

  @Version('1')
  @Get('op-level-sal-r')
  @ApiOperation({
    summary: 'ค้นหาข้อมูล OP_LEVEL_SAL_R_TEMP ด้วยเงื่อนไข',
    description:
      'สามารถกรองข้อมูล OP_LEVEL_SAL_R_TEMP ตาม plvCode, limit, offset ได้',
  })
  @ApiQuery({
    name: 'plvCode',
    required: false,
    description: 'PLV_CODE',
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'จำนวนรายการต่อหน้า',
    type: Number,
    example: 10,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description: 'ข้ามกี่รายการ',
    type: Number,
    example: 0,
  })
  findOpLevelSalRWithQuery(@Query() query: QueryOpLevelSalRDto): Promise<OpLevelSalRPaginate> {
    return this.dataviewsService.findOpLevelSalRWithQuery(query);
  }
}
