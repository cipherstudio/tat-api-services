import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { ExpensesOtherConditionsService } from '../services/expenses-other-conditions.service';
import { CreateExpensesOtherConditionsDto } from '../dto/create-expenses-other-conditions.dto';
import { UpdateExpensesOtherConditionsDto } from '../dto/update-expenses-other-conditions.dto';
import { ExpensesOtherConditionsQueryDto } from '../dto/expenses-other-conditions-query.dto';
import { ExpensesOtherConditions } from '../entities/expenses-other-conditions.entity';
import { ApiQuery, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Master Data')
@Controller('master-data/expenses-other-conditions')
export class ExpensesOtherConditionsController {
  constructor(
    private readonly expensesOtherConditionsService: ExpensesOtherConditionsService,
  ) {}

  @Post()
  create(
    @Body() createExpensesOtherConditionsDto: CreateExpensesOtherConditionsDto,
  ): Promise<ExpensesOtherConditions> {
    return this.expensesOtherConditionsService.create(
      createExpensesOtherConditionsDto,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all expenses other conditions' })
  @ApiResponse({
    status: 200,
    description: 'Return all expenses other conditions',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page',
  })
  @ApiQuery({
    name: 'orderBy',
    required: false,
    enum: [
      'id',
      'expensesOtherId',
      'positionName',
      'positionCode',
      'levelCode',
      'scope',
      'maxAmount',
      'createdAt',
      'updatedAt',
    ],
    description: 'Field to order by',
  })
  @ApiQuery({
    name: 'orderDir',
    required: false,
    enum: ['ASC', 'DESC'],
    description: 'Order direction',
  })
  @ApiQuery({
    name: 'positionName',
    required: false,
    type: String,
    description: 'ชื่อตำแหน่ง',
  })
  @ApiQuery({
    name: 'positionCode',
    required: false,
    type: String,
    description: 'รหัสตำแหน่ง',
  })
  @ApiQuery({
    name: 'levelCode',
    required: false,
    type: String,
    description: 'รหัสระดับ',
  })
  @ApiQuery({
    name: 'scope',
    required: false,
    enum: ['domestic', 'international'],
    description: 'ขอบเขต',
  })
  @ApiQuery({
    name: 'searchTerm',
    required: false,
    type: String,
    description: 'Search term',
  })
  @ApiQuery({
    name: 'createdAfter',
    required: false,
    type: Date,
    description: 'Created after date',
  })
  @ApiQuery({
    name: 'createdBefore',
    required: false,
    type: Date,
    description: 'Created before date',
  })
  @ApiQuery({
    name: 'updatedAfter',
    required: false,
    type: Date,
    description: 'Updated after date',
  })
  @ApiQuery({
    name: 'updatedBefore',
    required: false,
    type: Date,
    description: 'Updated before date',
  })
  findAll(
    @Query('page', new ValidationPipe({ transform: true })) page?: number,
    @Query('limit', new ValidationPipe({ transform: true })) limit?: number,
    @Query('orderBy') orderBy?: ExpensesOtherConditionsQueryDto['orderBy'],
    @Query('orderDir') orderDir?: 'asc' | 'desc',
    @Query('positionName') positionName?: string,
    @Query('positionCode') positionCode?: string,
    @Query('levelCode') levelCode?: string,
    @Query('scope') scope?: 'domestic' | 'international',
    @Query('searchTerm') searchTerm?: string,
    @Query('createdAfter', new ValidationPipe({ transform: true }))
    createdAfter?: Date,
    @Query('createdBefore', new ValidationPipe({ transform: true }))
    createdBefore?: Date,
    @Query('updatedAfter', new ValidationPipe({ transform: true }))
    updatedAfter?: Date,
    @Query('updatedBefore', new ValidationPipe({ transform: true }))
    updatedBefore?: Date,
  ) {
    const queryOptions: ExpensesOtherConditionsQueryDto = {
      offset: (page - 1) * limit,
      page,
      limit,
      orderBy,
      orderDir,
      positionName,
      positionCode,
      levelCode,
      scope,
      searchTerm,
      createdAfter,
      createdBefore,
      updatedAfter,
      updatedBefore,
    };

    return this.expensesOtherConditionsService.findAll(queryOptions);
  }

  @Get(':id')
  findById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ExpensesOtherConditions> {
    return this.expensesOtherConditionsService.findById(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateExpensesOtherConditionsDto: UpdateExpensesOtherConditionsDto,
  ): Promise<ExpensesOtherConditions> {
    return this.expensesOtherConditionsService.update(
      id,
      updateExpensesOtherConditionsDto,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.expensesOtherConditionsService.remove(id);
  }
}
