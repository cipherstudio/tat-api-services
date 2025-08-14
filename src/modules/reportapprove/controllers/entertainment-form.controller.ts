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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { EntertainmentFormService } from '../services/entertainment-form.service';
import { CreateEntertainmentFormDto } from '../dto/create-entertainment-form.dto';
import { UpdateEntertainmentFormDto } from '../dto/update-entertainment-form.dto';
import {
  EntertainmentFormQueryDto,
  EntertainmentFormStatus,
} from '../dto/entertainment-form-query.dto';
import { ReportEntertainmentForm } from '../entities/report-entertainment-form.entity';
import { EntertainmentFormStatus as StatusEntity } from '../entities/entertainment-form-status.entity';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@ApiTags('Entertainment Form')
@Controller('entertainment-form')
export class EntertainmentFormController {
  constructor(
    private readonly entertainmentFormService: EntertainmentFormService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get all entertainment forms with pagination and search',
    description: 'Supports filtering by: วันที่ทำเรื่อง (created_at), ชื่อผู้ขอ (employee_name), ตำแหน่ง (employee_position), จำนวนเงิน (total_amount), ประเภท (entertainment_type), and more. Users can only see forms they created.',
  })
  @ApiOkResponse({
    description: 'List of entertainment forms with pagination metadata',
  })
  async findAll(@Query() query: EntertainmentFormQueryDto, @Req() req: any) {
    const employeeCode = req.user.employee.code;
    return this.entertainmentFormService.findAll(query, employeeCode);
  }

  @Get('statuses')
  @ApiOperation({ summary: 'Get all entertainment form statuses' })
  @ApiOkResponse({ type: [StatusEntity] })
  async getStatuses() {
    return this.entertainmentFormService.getStatuses();
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get entertainment form by id with details',
    description: 'Users can only view entertainment forms they created. Returns 404 if form not found or not owned by user.'
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Entertainment form ID',
  })
  @ApiOkResponse({ type: ReportEntertainmentForm })
  async findOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const employeeCode = req.user.employee.code;
    return this.entertainmentFormService.findOne(id, employeeCode);
  }

  @Get(':id/items')
  @ApiOperation({ summary: 'Get entertainment form items by report id' })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Entertainment form ID',
  })
  @ApiOkResponse({ description: 'List of entertainment form items' })
  async getItems(@Param('id', ParseIntPipe) id: number) {
    return this.entertainmentFormService.getItemsByReportId(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new entertainment form' })
  @ApiBody({ type: CreateEntertainmentFormDto })
  @ApiResponse({ status: 201, type: ReportEntertainmentForm })
  async create(@Body() dto: CreateEntertainmentFormDto) {
    return this.entertainmentFormService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update entertainment form' })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Entertainment form ID',
  })
  @ApiBody({ type: UpdateEntertainmentFormDto })
  @ApiOkResponse({ type: ReportEntertainmentForm })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEntertainmentFormDto,
  ) {
    return this.entertainmentFormService.update(id, dto);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update entertainment form status' })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Entertainment form ID',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        statusId: {
          type: 'number',
          enum: Object.values(EntertainmentFormStatus),
          description: 'New status ID',
        },
        approvedBy: {
          type: 'string',
          description: 'Approver ID (required for approval)',
        },
        approvedComment: {
          type: 'string',
          description: 'Approval comment',
        },
      },
      required: ['statusId'],
    },
  })
  @ApiOkResponse({ type: ReportEntertainmentForm })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: {
      statusId: EntertainmentFormStatus;
      approvedBy?: string;
      approvedComment?: string;
    },
  ) {
    return this.entertainmentFormService.updateStatus(
      id,
      body.statusId,
      body.approvedBy,
      body.approvedComment,
    );
  }

  @Put(':id/calculate-total')
  @ApiOperation({ summary: 'Calculate and update total amount from items' })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Entertainment form ID',
  })
  @ApiOkResponse({ description: 'Updated total amount' })
  async calculateTotal(@Param('id', ParseIntPipe) id: number) {
    return this.entertainmentFormService.calculateTotalAmount(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete entertainment form (only draft status)' })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Entertainment form ID',
  })
  @ApiResponse({ status: 200, description: 'Deleted successfully' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.entertainmentFormService.remove(id);
  }
}
