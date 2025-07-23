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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiResponse,
  ApiBody,
  ApiParam,
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

@ApiTags('Entertainment Form')
@Controller('entertainment-form')
export class EntertainmentFormController {
  constructor(
    private readonly entertainmentFormService: EntertainmentFormService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get all entertainment forms with pagination and search',
  })
  @ApiOkResponse({
    description: 'List of entertainment forms with pagination metadata',
  })
  async findAll(@Query() query: EntertainmentFormQueryDto) {
    return this.entertainmentFormService.findAll(query);
  }

  @Get('statuses')
  @ApiOperation({ summary: 'Get all entertainment form statuses' })
  @ApiOkResponse({ type: [StatusEntity] })
  async getStatuses() {
    return this.entertainmentFormService.getStatuses();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get entertainment form by id with details' })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Entertainment form ID',
  })
  @ApiOkResponse({ type: ReportEntertainmentForm })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.entertainmentFormService.findOne(id);
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
