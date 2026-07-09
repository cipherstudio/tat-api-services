import {
  Controller,
  Get,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
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
import {
  buildExcelBuffer,
  thaiDateFilenamePart,
  inclusiveDayCount,
  resolveDestinationName,
  formatThaiDate,
  formatThaiDateNumeric,
  formatThaiCurrency,
} from '../../../common/utils/excel-export.util';

const TRAVEL_TYPE_LABELS: Record<string, string> = {
  'temporary-domestic': 'ชั่วคราวในประเทศ',
  'temporary-international': 'ชั่วคราวต่างประเทศ',
  'temporary-both': 'ชั่วคราวทั้งในประเทศและต่างประเทศ',
  domestic: 'ประจำในประเทศ',
  international: 'ประจำต่างประเทศ',
  'training-domestic': 'ฝึกอบรมในประเทศ',
  'training-international': 'ฝึกอบรมต่างประเทศ',
};

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
  @ApiQuery({ name: 'requesterName', required: false, description: 'ผู้ขออนุมัติ' })
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

  @Get('commute/export/excel')
  @ApiOperation({ summary: 'Export รายงานการเดินทางเป็น Excel' })
  @ApiQuery({ name: 'incrementId', required: false })
  @ApiQuery({ name: 'approvalStatus', required: false })
  @ApiQuery({ name: 'documentTitle', required: false })
  @ApiQuery({ name: 'requesterName', required: false })
  @ApiQuery({ name: 'approvalDateStart', required: false })
  @ApiQuery({ name: 'approvalDateEnd', required: false })
  @ApiQuery({ name: 'travelType', required: false })
  async exportCommuteReport(
    @Query() query: CommuteQueryDto,
    @Res() res: Response,
  ) {
    const queryOptions = {
      ...query,
      page: 1,
      limit: 100000,
      orderBy: query.orderBy || 'approval.increment_id',
      orderDir: query.orderDir || 'DESC',
    };
    const result = await this.usersReportsService.getCommuteReport(queryOptions);
    const { provinceNames, countryNames, officeLookup } =
      await this.usersReportsService.getDestinationNameLists();

    const buffer = await buildExcelBuffer(
      'รายงานระบบอนุมัติเดินทาง',
      [
        { header: 'ลำดับ', key: 'no', width: 10 },
        { header: 'เลขที่หนังสือ', key: 'incrementId', width: 18 },
        { header: 'ประเภทการเดินทาง', key: 'travelType', width: 22 },
        { header: 'ผู้ขออนุมัติ', key: 'name', width: 25 },
        { header: 'เรื่อง', key: 'documentTitle', width: 35 },
        { header: 'สถานที่เดินทาง (จังหวัด/ประเทศ)', key: 'destination', width: 30 },
        { header: 'จำนวนวันที่เดินทาง', key: 'travelDays', width: 16 },
        { header: 'วันที่เริ่มเดินทาง', key: 'workStartDate', width: 18 },
        { header: 'วันที่สิ้นสุดเดินทาง', key: 'workEndDate', width: 18 },
        { header: 'วันที่สร้างอนุมัติ', key: 'createdDate', width: 18 },
        { header: 'วันที่ขออนุมัติ', key: 'requestedDate', width: 18 },
        { header: 'วันที่อนุมัติ', key: 'approvalDate', width: 18 },
        { header: 'ยอดเงินที่ขอ', key: 'requestedAmount', width: 18 },
        { header: 'จำนวนผู้เดินทาง/คน', key: 'travelerCount', width: 18 },
        { header: 'สถานะ', key: 'statusLabel', width: 18 },
      ],
      result.data.map((item: any, index: number) => ({
        no: index + 1,
        incrementId: item.incrementId,
        travelType: TRAVEL_TYPE_LABELS[item.travelType] || item.travelType,
        name: item.name,
        documentTitle: item.documentTitle,
        destination: resolveDestinationName(
          item.workDestination || item.endCountry || item.startCountry,
          provinceNames,
          countryNames,
          officeLookup,
        ),
        travelDays: inclusiveDayCount(item.rangeStartDate, item.rangeEndDate) ?? '-',
        workStartDate: formatThaiDateNumeric(item.rangeStartDate),
        workEndDate: formatThaiDateNumeric(item.rangeEndDate),
        createdDate: formatThaiDateNumeric(item.createdAt),
        requestedDate: formatThaiDateNumeric(item.createdAt),
        approvalDate: formatThaiDateNumeric(item.approvalDate),
        requestedAmount: formatThaiCurrency(item.requestedAmount),
        travelerCount: item.travelerCount || 1,
        statusLabel: item.statusLabel,
      })),
    );

    const filename = `รายงานระบบอนุมัติเดินทาง (${thaiDateFilenamePart()}).xlsx`;
    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
    });
    res.send(buffer);
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

  @Get('work/export/excel')
  @ApiOperation({ summary: 'Export รายงานการจัดทำรายงานเดินทางปฏิบัติงานเป็น Excel' })
  @ApiQuery({ name: 'documentNumber', required: false })
  @ApiQuery({ name: 'title', required: false })
  @ApiQuery({ name: 'creatorName', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async exportWorkReport(
    @Query() query: WorkQueryDto,
    @Res() res: Response,
  ) {
    const queryOptions = {
      ...query,
      page: 1,
      limit: 100000,
      orderBy: query.orderBy || 'report_approve.created_at',
      orderDir: query.orderDir || 'DESC',
    };
    const result = await this.usersReportsService.getWorkReport(queryOptions);

    const buffer = await buildExcelBuffer(
      'รายงานการจัดทำรายงานเดินทางปฏิบัติงาน',
      [
        { header: 'ลำดับ', key: 'no', width: 10 },
        { header: 'หมายเลขเอกสาร', key: 'documentNumber', width: 18 },
        { header: 'ชื่อเอกสาร', key: 'title', width: 35 },
        { header: 'ผู้จัดทำรายงาน', key: 'creatorName', width: 25 },
        { header: 'วันที่สร้างเอกสาร', key: 'createdAt', width: 18 },
        { header: 'วันที่แก้ไขล่าสุด', key: 'updatedAt', width: 18 },
        { header: 'สถานะ', key: 'statusName', width: 18 },
      ],
      result.data.map((item: any, index: number) => ({
        no: index + 1,
        documentNumber: item.documentNumber,
        title: item.title,
        creatorName: item.creatorName,
        createdAt: formatThaiDateNumeric(item.createdAt),
        updatedAt: formatThaiDateNumeric(item.updatedAt),
        statusName: item.statusName,
      })),
    );

    const filename = `รายงานการจัดทำรายงานเดินทางปฏิบัติงาน (${thaiDateFilenamePart()}).xlsx`;
    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
    });
    res.send(buffer);
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
  @ApiQuery({ name: 'itemType', required: false, description: 'ประเภทรายการ (จาก approval_budgets.item_type)' })
  @ApiQuery({ name: 'department', required: false, description: 'หน่วยงานเจ้าของงบโครงการย่อย' })
  @ApiQuery({ name: 'documentTitle', required: false, description: 'เรื่อง' })
  @ApiQuery({ name: 'requesterName', required: false, description: 'ผู้ตั้งเรื่องอนุมัติ' })
  @ApiQuery({ name: 'incrementId', required: false, description: 'เลขที่หนังสือ' })
  @ApiQuery({ name: 'travelType', required: false, description: 'ประเภทการเดินทาง' })
  @ApiQuery({ name: 'approvalStatus', required: false, description: 'สถานะการอนุมัติ' })
  async getExpenditureReport(@Query() query: ExpenditureQueryDto) {
    const queryOptions = {
      page: query.page || 1,
      limit: query.limit || 10,
      orderBy: query.orderBy || 'approval.increment_id',
      orderDir: query.orderDir || 'DESC',
      ...query,
    };
    return this.usersReportsService.getExpenditureReport(queryOptions);
  }

  @Get('expenditure/export/excel')
  @ApiOperation({ summary: 'Export รายงานการใช้งบประมาณเป็น Excel' })
  async exportExpenditureReport(
    @Query() query: ExpenditureQueryDto,
    @Res() res: Response,
  ) {
    const queryOptions = {
      ...query,
      page: 1,
      limit: 100000,
      orderBy: query.orderBy || 'approval.increment_id',
      orderDir: query.orderDir || 'DESC',
    };
    const result = await this.usersReportsService.getExpenditureReport(queryOptions);
    const { provinceNames, countryNames, officeLookup } =
      await this.usersReportsService.getDestinationNameLists();

    let lastApprovalId: number | null = null;
    let documentNo = 0;
    const formatExcelDepartment = (item: any): string => {
      if (
        item.itemType === 'ตัดจ่ายจากใบจอง' ||
        item.itemType === 'งบจัดสรร'
      ) {
        return '-';
      }
      if (item.itemType === 'โครงการย่อย / กิจกรรม') {
        return item.pogDesc || '-';
      }
      return item.pogDesc || '-';
    };
    const formatExcelReservationCode = (item: any): string => {
      if (item.itemType === 'ตัดจ่ายจากใบจอง') {
        return item.reservationCode || '-';
      }
      return '-';
    };

    const rows = result.data.map((item: any) => {
      const isNewDocument = item.approvalId !== lastApprovalId;
      if (isNewDocument) {
        documentNo += 1;
        lastApprovalId = item.approvalId;
      }

      return {
        no: isNewDocument ? documentNo : '',
        incrementId: isNewDocument ? item.incrementId : '',
        travelType: isNewDocument ? (TRAVEL_TYPE_LABELS[item.travelType] || item.travelType) : '',
        budgetType: item.budgetType,
        itemType: item.itemType,
        department: formatExcelDepartment(item),
        reservationCode: formatExcelReservationCode(item),
        name: isNewDocument ? item.name : '',
        documentTitle: isNewDocument ? item.documentTitle : '',
        destination: isNewDocument
          ? resolveDestinationName(item.workDestination || item.endCountry, provinceNames, countryNames, officeLookup)
          : '',
        createdDate: isNewDocument ? formatThaiDateNumeric(item.approvalCreatedAt) : '',
        requestedDate: isNewDocument ? formatThaiDateNumeric(item.approvalCreatedAt) : '',
        approvalDate: isNewDocument ? formatThaiDateNumeric(item.approvalDate) : '',
        requestedAmount: isNewDocument ? formatThaiCurrency(item.requestedAmount) : '',
        statusLabel: isNewDocument ? item.statusLabel : '',
      };
    });

    const buffer = await buildExcelBuffer(
      'รายงานการใช้งบประมาณ',
      [
        { header: 'ลำดับ', key: 'no', width: 10 },
        { header: 'เลขที่หนังสือ', key: 'incrementId', width: 18 },
        { header: 'ประเภทการเดินทาง', key: 'travelType', width: 22 },
        { header: 'ประเภทงบประมาณ', key: 'budgetType', width: 18 },
        { header: 'ประเภทรายการ', key: 'itemType', width: 20 },
        { header: 'หน่วยงานเจ้าของงบประมาณ', key: 'department', width: 25 },
        { header: 'รหัสใบจองเงิน', key: 'reservationCode', width: 18 },
        { header: 'ผู้ขออนุมัติ', key: 'name', width: 25 },
        { header: 'เรื่อง', key: 'documentTitle', width: 35 },
        { header: 'สถานที่เดินทาง (จังหวัด/ประเทศ)', key: 'destination', width: 30 },
        { header: 'วันที่สร้างอนุมัติ', key: 'createdDate', width: 18 },
        { header: 'วันที่ขออนุมัติ', key: 'requestedDate', width: 18 },
        { header: 'วันที่อนุมัติ', key: 'approvalDate', width: 18 },
        { header: 'ยอดเงินที่ขอ', key: 'requestedAmount', width: 18 },
        { header: 'สถานะ', key: 'statusLabel', width: 18 },
      ],
      rows,
    );

    const filename = `รายงานการใช้งบประมาณระบบอนุมัติการเดินทาง (${thaiDateFilenamePart()}).xlsx`;
    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
    });
    res.send(buffer);
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
  @ApiQuery({
    name: 'cancellationStatus',
    required: false,
    enum: ['claimed', 'pending_cancel', 'cancelled'],
    description: 'สถานะ: เบิกค่าเครื่องแต่งตัว / ขออนุมัติยกเลิก / ยกเลิกสำเร็จ',
  })
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

  @Get('activity/export/excel')
  @ApiOperation({ summary: 'Export รายงานประวัติการเข้าใช้งานระบบเป็น Excel' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'employeeName', required: false })
  async exportActivityReport(
    @Query() query: ActivityQueryDto,
    @Res() res: Response,
  ) {
    const queryOptions = {
      ...query,
      page: 1,
      limit: 100000,
      orderBy: query.orderBy || 'created_at',
      orderDir: query.orderDir || 'DESC',
    };
    const result = await this.usersReportsService.getActivityReport(queryOptions);

    const buffer = await buildExcelBuffer(
      'รายงานประวัติการเข้าใช้งานระบบ',
      [
        { header: 'ลำดับ', key: 'no', width: 10 },
        { header: 'ชื่อ-สกุล', key: 'employeeName', width: 30 },
        { header: 'วันที่เข้าใช้งานระบบ', key: 'createdAt', width: 25 },
      ],
      result.data.map((item: any, index: number) => ({
        no: index + 1,
        employeeName: item.employeeName,
        createdAt: item.createdAt,
      })),
    );

    const filename = `รายงานประวัติการเข้าใช้งานระบบ (${thaiDateFilenamePart()}).xlsx`;
    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
    });
    res.send(buffer);
  }

  @Get('clothing/export/excel')
  @ApiOperation({ summary: 'Export รายงานค่าเครื่องแต่งตัวเป็น Excel' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'employeeName', required: false })
  @ApiQuery({ name: 'cancellationStatus', required: false })
  async exportClothingReport(
    @Query() query: ClothingQueryDto,
    @Res() res: Response,
  ) {
    const queryOptions = {
      ...query,
      page: 1,
      limit: 100000,
      orderBy: query.orderBy || 'created_at',
      orderDir: query.orderDir || 'DESC',
    };
    const result = await this.usersReportsService.getClothingReport(queryOptions);
    const { provinceNames, countryNames, officeLookup } =
      await this.usersReportsService.getDestinationNameLists();

    const isUuid = (value: unknown) =>
      typeof value === 'string' &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        value,
      );

    const buildRemark = (item: any): string => {
      const status = item.cancellationStatus || 'claimed';
      if (status === 'pending_cancel') {
        return [
          'ขออนุมัติยกเลิก',
          item.cancellationBy ? `โดย ${item.cancellationBy}` : '',
          item.cancellationAt ? `(${formatThaiDateNumeric(item.cancellationAt)})` : '',
        ].filter(Boolean).join(' ');
      }
      if (status === 'cancelled') {
        return [
          'ขออนุมัติยกเลิกสำเร็จ',
          item.cancellationBy ? `โดย ${item.cancellationBy}` : '',
          item.cancellationAt ? `(${formatThaiDateNumeric(item.cancellationAt)})` : '',
        ].filter(Boolean).join(' ');
      }
      return '-';
    };

    const buffer = await buildExcelBuffer(
      'รายงานค่าเครื่องแต่งตัว',
      [
        { header: 'ลำดับ', key: 'no', width: 10 },
        { header: 'ID(รหัสพนักงาน)', key: 'employeeCode', width: 15 },
        { header: 'ชื่อ-นามสกุล', key: 'employeeName', width: 30 },
        { header: 'เลขที่เอกสาร', key: 'incrementId', width: 18 },
        { header: 'ชื่อเรื่อง', key: 'documentTitle', width: 30 },
        { header: 'ประเทศที่เดินทางไป', key: 'destinationCountry', width: 20 },
        { header: 'ประเภทการเดินทาง', key: 'approvalTravelType', width: 20 },
        { header: 'ราคาตามสิทธิ์ (บาท)', key: 'clothingAmount', width: 18 },
        { header: 'วันที่เดินทางไป', key: 'workStartDate', width: 18 },
        { header: 'วันที่รายงานตัว', key: 'reportingDate', width: 18 },
        { header: 'วันที่เบิกได้ครั้งถัดไป', key: 'nextClaimDate', width: 20 },
        { header: 'หมายเหตุ', key: 'remark', width: 30 },
      ],
      result.data.map((item: any, index: number) => ({
        no: index + 1,
        employeeCode: isUuid(item.employeeCode) ? '-' : item.employeeCode,
        employeeName: item.employeeName,
        incrementId: item.incrementId || item.approvalIncrementId,
        documentTitle: item.documentTitle,
        destinationCountry: resolveDestinationName(item.destinationCountry, provinceNames, countryNames, officeLookup),
        approvalTravelType: TRAVEL_TYPE_LABELS[item.approvalTravelType] || item.approvalTravelType,
        clothingAmount: item.clothingAmount,
        workStartDate: formatThaiDateNumeric(item.workStartDate),
        reportingDate: formatThaiDateNumeric(item.reportingDate),
        nextClaimDate: formatThaiDateNumeric(item.nextClaimDate),
        remark: buildRemark(item),
      })),
    );

    const filename = `รายงานค่าเครื่องแต่งตัว (${thaiDateFilenamePart()}).xlsx`;
    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
    });
    res.send(buffer);
  }
} 