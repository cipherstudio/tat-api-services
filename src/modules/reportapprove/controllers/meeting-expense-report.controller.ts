import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { MeetingExpenseReportService } from '../services/meeting-expense-report.service';
import { CreateMeetingExpenseReportDto } from '../dto/create-meeting-expense-report.dto';
import { UpdateMeetingExpenseReportDto } from '../dto/update-meeting-expense-report.dto';
import { MeetingExpenseReportQueryDto } from '../dto/meeting-expense-report-query.dto';
import { MeetingExpenseReport } from '../entities/meeting-expense-report.entity';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@ApiTags('Meeting Expense Reports')
@Controller('meeting-expense-reports')
export class MeetingExpenseReportController {
  constructor(
    private readonly meetingExpenseReportService: MeetingExpenseReportService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get all meeting expense reports with pagination and search',
    description: 'Users can only see reports they created.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully retrieved meeting expense reports',
  })
  async findAll(@Query() query: MeetingExpenseReportQueryDto, @Req() req: any) {
    const employeeCode = req.user.employee.code;
    return this.meetingExpenseReportService.findAll(query, employeeCode);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get meeting expense report by ID',
    description: 'Users can only view reports they created. Returns 404 if report not found or not owned by user.'
  })
  @ApiParam({ name: 'id', description: 'Meeting expense report ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully retrieved meeting expense report',
    type: MeetingExpenseReport,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Meeting expense report not found',
  })
  async findById(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const employeeCode = req.user.employee.code;
    return this.meetingExpenseReportService.findById(id, employeeCode);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new meeting expense report' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Successfully created meeting expense report',
    type: MeetingExpenseReport,
  })
  async create(@Body() createDto: CreateMeetingExpenseReportDto) {
    return this.meetingExpenseReportService.create(createDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update meeting expense report' })
  @ApiParam({ name: 'id', description: 'Meeting expense report ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully updated meeting expense report',
    type: MeetingExpenseReport,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Meeting expense report not found',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateMeetingExpenseReportDto,
  ) {
    return this.meetingExpenseReportService.update(id, updateDto);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update meeting expense report status' })
  @ApiParam({ name: 'id', description: 'Meeting expense report ID' })
  @ApiQuery({ name: 'status', description: 'New status' })
  @ApiQuery({
    name: 'statusDescription',
    description: 'Status description',
    required: false,
  })
  @ApiQuery({
    name: 'updatedBy',
    description: 'User who updated',
    required: false,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully updated meeting expense report status',
    type: MeetingExpenseReport,
  })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Query('status') status: string,
    @Query('statusDescription') statusDescription?: string,
    @Query('updatedBy') updatedBy?: string,
  ) {
    return this.meetingExpenseReportService.updateStatus(
      id,
      status,
      statusDescription,
      updatedBy,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete meeting expense report (soft delete)' })
  @ApiParam({ name: 'id', description: 'Meeting expense report ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully deleted meeting expense report',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Meeting expense report not found',
  })
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.meetingExpenseReportService.delete(id);
  }

  @Get('types/meeting-types')
  @ApiOperation({ summary: 'Get all active meeting types' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully retrieved meeting types',
  })
  async getMeetingTypes() {
    return this.meetingExpenseReportService.getMeetingTypes();
  }

  @Get('types/rates')
  @ApiOperation({ summary: 'Get meeting type rates' })
  @ApiQuery({
    name: 'meetingTypeId',
    description: 'Meeting type ID',
    required: false,
  })
  @ApiQuery({
    name: 'date',
    description: 'Date for rate lookup',
    required: false,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully retrieved meeting type rates',
  })
  async getMeetingTypeRates(
    @Query('meetingTypeId') meetingTypeId?: string,
    @Query('date') date?: string,
  ) {
    return this.meetingExpenseReportService.getMeetingTypeRates(
      meetingTypeId ? parseInt(meetingTypeId) : undefined,
      date,
    );
  }
}
