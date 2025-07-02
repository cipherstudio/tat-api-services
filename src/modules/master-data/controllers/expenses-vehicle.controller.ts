import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  Query,
  ValidationPipe,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { ExpensesVehicle } from '../entities/expenses-vehicle.entity';
import { UpdateExpensesVehicleDto } from '../dto/expenses-vehicle.dto';
import { ExpensesVehicleQueryDto } from '../dto/expenses-vehicle-query.dto';
import { ExpensesVehicleService } from '../services/expenses-vehicle.service';
import { PaginatedResult } from '@common/interfaces/pagination.interface';

@ApiTags('Master Data')
@Controller('master-data/expenses-vehicle')
export class ExpensesVehicleController {
  constructor(private readonly service: ExpensesVehicleService) {}

  @Get()
  @ApiOperation({ summary: 'Get all expenses vehicle' })
  @ApiQuery({
    name: 'page',
    type: Number,
    required: false,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    description: 'Number of items per page',
  })
  @ApiQuery({
    name: 'orderBy',
    type: String,
    required: false,
    description: 'Field to order by',
  })
  @ApiQuery({
    name: 'orderDir',
    type: String,
    required: false,
    description: 'Order direction',
  })
  @ApiQuery({
    name: 'code',
    type: String,
    required: false,
    description: 'Code',
  })
  @ApiQuery({
    name: 'title',
    type: String,
    required: false,
    description: 'Title',
  })
  @ApiQuery({
    name: 'searchTerm',
    type: String,
    required: false,
    description: 'Search term',
  })
  @ApiQuery({
    name: 'createdAfter',
    type: Date,
    required: false,
    description: 'Created after',
  })
  @ApiQuery({
    name: 'createdBefore',
    type: Date,
    required: false,
    description: 'Created before',
  })
  @ApiQuery({
    name: 'updatedAfter',
    type: Date,
    required: false,
    description: 'Updated after',
  })
  @ApiQuery({
    name: 'updatedBefore',
    type: Date,
    required: false,
    description: 'Updated before',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all expenses vehicle',
    type: [ExpensesVehicle],
  })
  async findAll(
    @Query('page', new ValidationPipe({ transform: true })) page?: number,
    @Query('limit', new ValidationPipe({ transform: true })) limit?: number,
    @Query('orderBy') orderBy?: ExpensesVehicleQueryDto['orderBy'],
    @Query('orderDir') orderDir?: 'asc' | 'desc',
    @Query('code') code?: string,
    @Query('title') title?: string,
    @Query('searchTerm') searchTerm?: string,
    @Query('createdAfter', new ValidationPipe({ transform: true }))
    createdAfter?: Date,
    @Query('createdBefore', new ValidationPipe({ transform: true }))
    createdBefore?: Date,
    @Query('updatedAfter', new ValidationPipe({ transform: true }))
    updatedAfter?: Date,
    @Query('updatedBefore', new ValidationPipe({ transform: true }))
    updatedBefore?: Date,
  ): Promise<PaginatedResult<ExpensesVehicle>> {
    const queryOptions: ExpensesVehicleQueryDto = {
      offset: (page - 1) * limit,
      page,
      limit,
      orderBy,
      orderDir,
      code,
      title,
      searchTerm,
      createdAfter,
      createdBefore,
      updatedAfter,
      updatedBefore,
    };

    return this.service.findAll(queryOptions);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update expenses vehicle by ID' })
  @ApiResponse({
    status: 200,
    description: 'The expenses vehicle has been successfully updated',
    type: ExpensesVehicle,
  })
  @ApiResponse({ status: 404, description: 'Expenses vehicle not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateExpensesVehicleDto,
  ): Promise<ExpensesVehicle> {
    return this.service.update(id, updateDto);
  }
}
