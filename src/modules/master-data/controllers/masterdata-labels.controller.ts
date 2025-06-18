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
import { MasterdataLabelsService } from '../services/masterdata-labels.service';
import { CreateMasterdataLabelsDto } from '../dto/create-masterdata-labels.dto';
import { MasterdataLabelsQueryDto } from '../dto/masterdata-labels-query.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { UpdateMasterdataLabelsDto } from '../dto/update-masterdata-labels.dto';

@ApiTags('Master Data')
@Controller('master-data/labels')
export class MasterdataLabelsController {
  constructor(
    private readonly masterdataLabelsService: MasterdataLabelsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all masterdata labels (with pagination)' })
  @ApiOkResponse({
    description: 'List of masterdata labels with pagination meta',
    schema: {
      example: {
        data: [
          {
            id: 1,
            tableName: 'holiday_work_rates',
            tableDescription: 'อัตราค่าตอบแทนการทำงานในวันหยุด',
            documentReference: 'DOC-001',
            documentName: 'ระเบียบการจ่ายค่าตอบแทน',
            documentDate: '2024-06-16',
            documentUrl: 'https://example.com/doc',
            updatedBy: 'admin',
            createdAt: '2024-06-16T00:00:00.000Z',
            updatedAt: '2024-06-16T00:00:00.000Z',
          },
        ],
        meta: { total: 1, page: 1, limit: 10, lastPage: 1 },
      },
    },
  })
  async findAll(@Query() query: MasterdataLabelsQueryDto) {
    return this.masterdataLabelsService.findAll(query);
  }

  @Get('table/:tableName')
  @ApiOperation({ summary: 'Get masterdata label by table name' })
  @ApiOkResponse({
    description: 'Masterdata label with the specified table name',
    schema: {
      example: {
        id: 1,
        tableName: 'holiday_work_rates',
        tableDescription: 'อัตราค่าตอบแทนการทำงานในวันหยุด',
        documentReference: 'DOC-001',
        documentName: 'ระเบียบการจ่ายค่าตอบแทน',
        documentDate: '2024-06-16',
        documentUrl: 'https://example.com/doc',
        updatedBy: 'admin',
        createdAt: '2024-06-16T00:00:00.000Z',
        updatedAt: '2024-06-16T00:00:00.000Z',
      },
    },
  })
  async getWithTableName(@Param('tableName') tableName: string) {
    return this.masterdataLabelsService.getWithTableName(tableName);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get masterdata label by id' })
  @ApiOkResponse({
    description: 'Masterdata label with the specified id',
    schema: {
      example: {
        id: 1,
        tableName: 'holiday_work_rates',
        tableDescription: 'อัตราค่าตอบแทนการทำงานในวันหยุด',
        documentReference: 'DOC-001',
        documentName: 'ระเบียบการจ่ายค่าตอบแทน',
        documentDate: '2024-06-16',
        documentUrl: 'https://example.com/doc',
        updatedBy: 'admin',
        createdAt: '2024-06-16T00:00:00.000Z',
        updatedAt: '2024-06-16T00:00:00.000Z',
      },
    },
  })
  async findOne(@Param('id') id: number) {
    return this.masterdataLabelsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create masterdata label' })
  @ApiBody({
    type: CreateMasterdataLabelsDto,
    examples: {
      example1: {
        value: {
          table_name: 'holiday_work_rates',
          table_description: 'อัตราค่าตอบแทนการทำงานในวันหยุด',
          document_reference: 'DOC-001',
          document_name: 'ระเบียบการจ่ายค่าตอบแทน',
          document_date: '2024-06-16',
          document_url: 'https://example.com/doc',
          updated_by: 'admin',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Created masterdata label',
    schema: {
      example: {
        id: 1,
        tableName: 'holiday_work_rates',
        tableDescription: 'อัตราค่าตอบแทนการทำงานในวันหยุด',
        documentReference: 'DOC-001',
        documentName: 'ระเบียบการจ่ายค่าตอบแทน',
        documentDate: '2024-06-16',
        documentUrl: 'https://example.com/doc',
        updatedBy: 'admin',
        createdAt: '2024-06-16T00:00:00.000Z',
        updatedAt: '2024-06-16T00:00:00.000Z',
      },
    },
  })
  async create(@Body() dto: CreateMasterdataLabelsDto) {
    return this.masterdataLabelsService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update masterdata label' })
  @ApiBody({
    type: UpdateMasterdataLabelsDto,
    examples: {
      example1: {
        value: {
          table_name: 'holiday_work_rates',
          table_description: 'อัตราค่าตอบแทนการทำงานในวันหยุด',
          document_reference: 'DOC-001',
          document_name: 'ระเบียบการจ่ายค่าตอบแทน',
          document_date: '2024-06-16',
          document_url: 'https://example.com/doc',
          updated_by: 'admin',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Updated masterdata label',
    schema: {
      example: {
        id: 1,
        tableName: 'holiday_work_rates',
        tableDescription: 'อัตราค่าตอบแทนการทำงานในวันหยุด',
        documentReference: 'DOC-001',
        documentName: 'ระเบียบการจ่ายค่าตอบแทน',
        documentDate: '2024-06-16',
        documentUrl: 'https://example.com/doc',
        updatedBy: 'admin',
        createdAt: '2024-06-16T00:00:00.000Z',
        updatedAt: '2024-06-16T00:00:00.000Z',
      },
    },
  })
  async update(
    @Param('id') id: number,
    @Body() dto: UpdateMasterdataLabelsDto,
  ) {
    return this.masterdataLabelsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete masterdata label' })
  @ApiResponse({ status: 200, description: 'Deleted successfully' })
  async remove(@Param('id') id: number) {
    return this.masterdataLabelsService.remove(id);
  }
}
