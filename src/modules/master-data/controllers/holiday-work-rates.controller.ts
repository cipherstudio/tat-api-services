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
import { HolidayWorkRatesService } from '../services/holiday-work-rates.service';
import { CreateHolidayWorkRatesDto } from '../dto/create-holiday-work-rates.dto';
import { UpdateHolidayWorkRatesDto } from '../dto/update-holiday-work-rates.dto';
import { HolidayWorkRatesQueryDto } from '../dto/holiday-work-rates-query.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('Master Data')
@Controller('master-data/holiday-work-rates')
// @UseGuards(JwtAuthGuard)
// @ApiBearerAuth('JWT-auth')
export class HolidayWorkRatesController {
  constructor(
    private readonly holidayWorkRatesService: HolidayWorkRatesService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all holiday work rates (with pagination)' })
  @ApiOkResponse({
    description: 'List of holiday work rates with pagination meta',
    schema: {
      example: {
        data: [
          {
            id: 1,
            stepLevel: 1,
            salary: 15000,
            createdAt: '2024-06-16T00:00:00.000Z',
            updatedAt: '2024-06-16T00:00:00.000Z',
            hours: [
              {
                id: 1,
                hour: 1,
                workPay: 100,
                taxRate: 3,
                createdAt: '2024-06-16T00:00:00.000Z',
                updatedAt: '2024-06-16T00:00:00.000Z',
              },
            ],
          },
        ],
        meta: { total: 1, page: 1, limit: 10, lastPage: 1 },
      },
    },
  })
  async findAll(@Query() query: HolidayWorkRatesQueryDto) {
    return this.holidayWorkRatesService.findAll(query);
  }

  @Get('salary/:salary')
  @ApiOperation({ summary: 'Get holiday work rate by salary' })
  @ApiOkResponse({
    description: 'Holiday work rate with the specified salary',
    schema: {
      example: {
        id: 1,
        stepLevel: 1,
        salary: 15000,
        createdAt: '2024-06-16T00:00:00.000Z',
        updatedAt: '2024-06-16T00:00:00.000Z',
        hours: [
          {
            id: 1,
            hour: 1,
            workPay: 100,
            taxRate: 3,
            createdAt: '2024-06-16T00:00:00.000Z',
            updatedAt: '2024-06-16T00:00:00.000Z',
          },
        ],
      },
    },
  })
  async findWithSalary(@Param('salary') salary: number) {
    return this.holidayWorkRatesService.findWithSalary(Number(salary));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get holiday work rate by id' })
  @ApiOkResponse({
    description: 'Holiday work rate with the specified id',
    schema: {
      example: {
        id: 1,
        stepLevel: 1,
        salary: 15000,
        createdAt: '2024-06-16T00:00:00.000Z',
        updatedAt: '2024-06-16T00:00:00.000Z',
        hours: [
          {
            id: 1,
            hour: 1,
            workPay: 100,
            taxRate: 3,
            createdAt: '2024-06-16T00:00:00.000Z',
            updatedAt: '2024-06-16T00:00:00.000Z',
          },
        ],
      },
    },
  })
  async findOne(@Param('id') id: number) {
    return this.holidayWorkRatesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create holiday work rate' })
  @ApiBody({
    type: CreateHolidayWorkRatesDto,
    examples: {
      example1: {
        value: {
          step_level: 1,
          salary: 15000,
          hours: [
            { hour: 1, work_pay: 100, tax_rate: 3 },
            { hour: 2, work_pay: 200, tax_rate: 3 },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Created holiday work rate',
    schema: {
      example: {
        id: 1,
        stepLevel: 1,
        salary: 15000,
        createdAt: '2024-06-16T00:00:00.000Z',
        updatedAt: '2024-06-16T00:00:00.000Z',
        hours: [
          {
            id: 1,
            hour: 1,
            workPay: 100,
            taxRate: 3,
            createdAt: '2024-06-16T00:00:00.000Z',
            updatedAt: '2024-06-16T00:00:00.000Z',
          },
        ],
      },
    },
  })
  async create(@Body() dto: CreateHolidayWorkRatesDto) {
    return this.holidayWorkRatesService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update holiday work rate' })
  @ApiBody({
    type: UpdateHolidayWorkRatesDto,
    examples: {
      example1: {
        value: {
          step_level: 1,
          salary: 15000,
          hours: [
            { id: 1, hour: 1, work_pay: 100, tax_rate: 3 },
            { id: 2, hour: 2, work_pay: 200, tax_rate: 3 },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Updated holiday work rate',
    schema: {
      example: {
        id: 1,
        stepLevel: 1,
        salary: 15000,
        createdAt: '2024-06-16T00:00:00.000Z',
        updatedAt: '2024-06-16T00:00:00.000Z',
        hours: [
          {
            id: 1,
            hour: 1,
            workPay: 100,
            taxRate: 3,
            createdAt: '2024-06-16T00:00:00.000Z',
            updatedAt: '2024-06-16T00:00:00.000Z',
          },
        ],
      },
    },
  })
  async update(
    @Param('id') id: number,
    @Body() dto: UpdateHolidayWorkRatesDto,
  ) {
    return this.holidayWorkRatesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete holiday work rate' })
  @ApiResponse({ status: 200, description: 'Deleted successfully' })
  async remove(@Param('id') id: number) {
    return this.holidayWorkRatesService.remove(id);
  }
}
