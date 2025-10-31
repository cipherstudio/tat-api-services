import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { ReportApproveService } from '../services/report-approve.service';
import { CreateReportApproveDto } from '../dto/create-report-approve.dto';
import { UpdateReportApproveDto } from '../dto/update-report-approve.dto';
import { ReportApproveQueryDto } from '../dto/report-approve-query.dto';
import { ReportApprove } from '../entities/report-approve.entity';

@ApiTags('Report Approve')
@Controller('report-approve')
export class ReportApproveController {
  constructor(private readonly reportApproveService: ReportApproveService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Get all report approvals with pagination and search',
    description: 'Supports filtering by: title, creator name, creator code, document number, status, approve ID, and date range (startDate, endDate).'
  })
  @ApiOkResponse({ type: [ReportApprove] })
  async findAll(@Query() query: ReportApproveQueryDto) {
    return this.reportApproveService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get report approval by id' })
  @ApiOkResponse({ type: ReportApprove })
  async findOne(@Param('id') id: number) {
    return this.reportApproveService.findOne(+id);
  }

  @Post()
  @ApiOperation({ summary: 'Create report approval' })
  @ApiBody({ type: CreateReportApproveDto })
  @ApiResponse({ status: 201, type: ReportApprove })
  async create(@Body() dto: CreateReportApproveDto) {
    return this.reportApproveService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update report approval' })
  @ApiBody({ type: UpdateReportApproveDto })
  @ApiOkResponse({ type: ReportApprove })
  async update(@Param('id') id: number, @Body() dto: UpdateReportApproveDto) {
    return this.reportApproveService.update(+id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete report approval' })
  @ApiResponse({ status: 200, description: 'Deleted successfully' })
  async remove(@Param('id') id: number) {
    return this.reportApproveService.remove(+id);
  }
}
