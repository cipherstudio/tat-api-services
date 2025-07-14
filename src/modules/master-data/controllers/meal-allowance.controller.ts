import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { MealAllowanceService } from '../services/meal-allowance.service';
import { CreateMealAllowanceDto } from '../dto/create-meal-allowance.dto';
import { UpdateMealAllowanceDto } from '../dto/update-meal-allowance.dto';
import { MealAllowanceQueryDto } from '../dto/meal-allowance-query.dto';

@ApiTags('Master Data')
@Controller('master-data/meal-allowance')
export class MealAllowanceController {
  constructor(private readonly mealAllowanceService: MealAllowanceService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all meal allowances',
    description:
      'ดึงข้อมูล meal allowance ทั้งหมด สามารถกรองข้อมูลด้วย query parameters ได้',
  })
  @ApiOkResponse({
    description: 'List of meal allowances',
    schema: {
      example: {
        data: [
          {
            meal_allowance_id: 1,
            type: 'meeting',
            rate_per_day: 500,
            location: 'in',
            created_at: '2024-07-14T00:00:00.000Z',
            updated_at: '2024-07-14T00:00:00.000Z',
            levels: [
              { meal_allowance_id: 1, level: '03' },
              { meal_allowance_id: 1, level: 'กรรมการ' },
            ],
          },
        ],
        meta: {
          total: 1,
          lastPage: 1,
          page: 1,
          limit: 10,
        },
      },
    },
  })
  async findAll(@Query() query: MealAllowanceQueryDto) {
    return this.mealAllowanceService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get meal allowance by id',
    description: 'ดึงข้อมูล meal allowance ตาม id พร้อมข้อมูลระดับ (levels)',
  })
  @ApiOkResponse({
    description: 'Meal allowance with the specified id',
    schema: {
      example: {
        meal_allowance_id: 1,
        type: 'meeting',
        rate_per_day: 500,
        location: 'in',
        created_at: '2024-07-14T00:00:00.000Z',
        updated_at: '2024-07-14T00:00:00.000Z',
        levels: [
          { meal_allowance_id: 1, level: '03' },
          { meal_allowance_id: 1, level: 'กรรมการ' },
        ],
      },
    },
  })
  async findOne(@Param('id') id: number) {
    return this.mealAllowanceService.findOne(Number(id));
  }

  @Post()
  @ApiOperation({
    summary: 'Create meal allowance',
    description: 'สร้างข้อมูล meal allowance ใหม่ พร้อมระบุระดับ (levels)',
  })
  @ApiBody({
    type: CreateMealAllowanceDto,
    examples: {
      example1: {
        value: {
          type: 'meeting',
          rate_per_day: 500,
          location: 'in',
          levels: [{ level: '03' }, { level: 'กรรมการ' }],
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Created meal allowance',
    schema: {
      example: {
        meal_allowance_id: 2,
        type: 'training',
        rate_per_day: 600,
        location: 'out',
        created_at: '2024-07-14T00:00:00.000Z',
        updated_at: '2024-07-14T00:00:00.000Z',
        levels: [{ meal_allowance_id: 2, level: '04' }],
      },
    },
  })
  async create(@Body() dto: CreateMealAllowanceDto) {
    const result = await this.mealAllowanceService.create(dto);
    if (
      result &&
      typeof result === 'object' &&
      !Array.isArray(result) &&
      'success' in result &&
      (result as any).success === false
    ) {
      throw new BadRequestException({ ...(result as object) });
    }
    return result;
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update meal allowance',
    description: 'อัปเดตข้อมูล meal allowance และระดับ (levels)',
  })
  @ApiBody({
    type: UpdateMealAllowanceDto,
    examples: {
      example1: {
        value: {
          type: 'meeting',
          rate_per_day: 700,
          location: 'abroad',
          levels: [{ level: '05' }],
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Updated meal allowance',
    schema: {
      example: {
        meal_allowance_id: 2,
        type: 'meeting',
        rate_per_day: 700,
        location: 'abroad',
        created_at: '2024-07-14T00:00:00.000Z',
        updated_at: '2024-07-14T00:00:00.000Z',
        levels: [{ meal_allowance_id: 2, level: '05' }],
      },
    },
  })
  async update(@Param('id') id: number, @Body() dto: UpdateMealAllowanceDto) {
    const result = await this.mealAllowanceService.update(Number(id), dto);
    if (
      result &&
      typeof result === 'object' &&
      !Array.isArray(result) &&
      'success' in result &&
      (result as any).success === false
    ) {
      throw new BadRequestException({ ...(result as object) });
    }
    return result;
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete meal allowance',
    description: 'ลบข้อมูล meal allowance และระดับ (levels) ที่เกี่ยวข้อง',
  })
  @ApiResponse({
    status: 200,
    description: 'Deleted meal allowance',
    schema: {
      example: { success: true },
    },
  })
  async remove(@Param('id') id: number) {
    return this.mealAllowanceService.remove(Number(id));
  }
}
