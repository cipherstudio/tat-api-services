import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
  Req,
  UseGuards,
  HttpStatus,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { CertificateReportService } from '../services/certificate-report.service';
import { CreateCertificateReportDto } from '../dto/create-certificate-report.dto';
import { UpdateCertificateReportDto } from '../dto/update-certificate-report.dto';
import { CertificateReportQueryDto } from '../dto/certificate-report-query.dto';
import { ReportCertificate } from '../entities/report-certificate.entity';
import { ReportCertificateExpense } from '../entities/report-certificate-expense.entity';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@UsePipes(new ValidationPipe({ 
  transform: true, 
  whitelist: true,
  forbidNonWhitelisted: true,
  transformOptions: { enableImplicitConversion: true }
}))
@ApiBearerAuth('JWT-auth')
@ApiTags('Certificate Reports')
@Controller('certificate-reports')
export class CertificateReportController {
  constructor(
    private readonly certificateReportService: CertificateReportService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get all certificate reports with pagination and search',
    description: 'Supports filtering by: ประเภทพนักงาน (employee_type), รหัสพนักงาน (employee_code), ชื่อพนักงาน (employee_name), ตำแหน่ง (employee_position), แผนก (department), จำนวนเงิน (total_amount), วันที่สร้าง (created_at), เวลาออก (time_out), เวลาเข้า (time_in), เลขที่คำสั่งจ่าย (payment_order_number), ประเภทการจ่ายเงิน (is_payment_without_receipt, is_payment_nonstandard_receipt, is_payment_with_lost_receipt, is_payment_with_lost_document), and more. Returns expense_details field with formatted expense information. Users can only see reports they created.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiQuery({ name: 'employee_type', required: false, type: String })
  @ApiQuery({ name: 'employee_code', required: false, type: String })
  @ApiQuery({ name: 'employee_name', required: false, type: String })
  @ApiQuery({ name: 'employee_position', required: false, type: String })
  @ApiQuery({ name: 'department', required: false, type: String })
  @ApiQuery({ name: 'min_amount', required: false, type: Number })
  @ApiQuery({ name: 'max_amount', required: false, type: Number })
  @ApiQuery({ name: 'created_at_from', required: false, type: String })
  @ApiQuery({ name: 'created_at_to', required: false, type: String })
  @ApiQuery({ name: 'time_out_from', required: false, type: String, description: 'เวลาออกตั้งแต่ (HH:MM)' })
  @ApiQuery({ name: 'time_out_to', required: false, type: String, description: 'เวลาออกถึง (HH:MM)' })
  @ApiQuery({ name: 'time_in_from', required: false, type: String, description: 'เวลาเข้าตั้งแต่ (HH:MM)' })
  @ApiQuery({ name: 'time_in_to', required: false, type: String, description: 'เวลาเข้าถึง (HH:MM)' })
  @ApiQuery({ name: 'is_payment_order_number_1', required: false, type: Boolean })
  @ApiQuery({ name: 'is_payment_order_number_2', required: false, type: Boolean })
  @ApiQuery({ name: 'is_payment_without_receipt', required: false, type: Boolean })
  @ApiQuery({ name: 'is_payment_nonstandard_receipt', required: false, type: Boolean })
  @ApiQuery({ name: 'is_payment_with_lost_receipt', required: false, type: Boolean })
  @ApiQuery({ name: 'is_payment_with_lost_document', required: false, type: Boolean })
  @ApiQuery({ name: 'expense_details_search', required: false, type: String, description: 'ค้นหาในรายละเอียดค่าใช้จ่าย' })
  @ApiOkResponse({
    description: 'List of certificate reports with pagination metadata',
  })
  async findAll(@Query() query: CertificateReportQueryDto, @Req() req: any) {
    const employeeCode = req.user?.employee?.code;
    return this.certificateReportService.findAll(query, employeeCode);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get certificate report by id with details',
    description: 'Users can only view certificate reports they created. Returns 404 if report not found or not owned by user.'
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Certificate report ID',
  })
  @ApiOkResponse({ type: ReportCertificate })
  @ApiResponse({ status: 404, description: 'Certificate report not found' })
  async findOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const employeeCode = req.user?.employee?.code;
    return this.certificateReportService.findOne(id, employeeCode);
  }

  @Get(':id/expenses')
  @ApiOperation({ summary: 'Get certificate report expenses by report id' })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Certificate report ID',
  })
  @ApiOkResponse({ 
    description: 'List of certificate report expenses',
    type: [ReportCertificateExpense]
  })
  @ApiResponse({ status: 404, description: 'Certificate report not found' })
  async getExpenses(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const employeeCode = req.user?.employee?.code;
    return this.certificateReportService.getExpensesByReportId(id, employeeCode);
  }

  @Post()
  @ApiOperation({ summary: 'Create new certificate report' })
  @ApiBody({ type: CreateCertificateReportDto })
  @ApiResponse({ status: 201, type: ReportCertificate })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(@Body() dto: CreateCertificateReportDto, @Req() req: any) {
    const createdBy = req.user?.employee?.code || req.user?.username || 'system';
    return this.certificateReportService.create(dto, createdBy);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update certificate report' })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Certificate report ID',
  })
  @ApiBody({ type: UpdateCertificateReportDto })
  @ApiOkResponse({ type: ReportCertificate })
  @ApiResponse({ status: 404, description: 'Certificate report not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCertificateReportDto,
    @Req() req: any,
  ) {
    const updatedBy = req.user?.employee?.code || req.user?.username || 'system';
    const employeeCode = req.user?.employee?.code;
    return this.certificateReportService.update(id, dto, updatedBy, employeeCode);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete certificate report' })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Certificate report ID',
  })
  @ApiResponse({ status: 200, description: 'Certificate report deleted successfully' })
  @ApiResponse({ status: 404, description: 'Certificate report not found' })
  async delete(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const employeeCode = req.user?.employee?.code;
    await this.certificateReportService.delete(id, employeeCode);
    return { message: 'Certificate report deleted successfully' };
  }
}

