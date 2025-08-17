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
import { ExpensesOtherService } from '../services/expenses-other.service';
import { CreateExpensesOtherDto } from '../dto/create-expenses-other.dto';
import { UpdateExpensesOtherDto } from '../dto/update-expenses-other.dto';
import { ExpensesOtherQueryDto } from '../dto/expenses-other-query.dto';
import { PaginatedResult } from '@common/interfaces/pagination.interface';
import { ExpensesOther } from '../entities/expenses-other.entity';
import { ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('Master Data')
@Controller('master-data/expenses-other')
export class ExpensesOtherController {
  constructor(private readonly expensesOtherService: ExpensesOtherService) {}

  @Post()
  create(
    @Body() createExpensesOtherDto: CreateExpensesOtherDto,
  ): Promise<ExpensesOther> {
    return this.expensesOtherService.create(createExpensesOtherDto);
  }

  @Get()
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
    name: 'name',
    type: String,
    required: false,
    description: 'Name',
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
  findAll(
    @Query('page', new ValidationPipe({ transform: true })) page?: number,
    @Query('limit', new ValidationPipe({ transform: true })) limit?: number,
    @Query('orderBy') orderBy?: ExpensesOtherQueryDto['orderBy'],
    @Query('orderDir') orderDir?: 'asc' | 'desc',
    @Query('name') name?: string,
    @Query('searchTerm') searchTerm?: string,
    @Query('createdAfter', new ValidationPipe({ transform: true }))
    createdAfter?: Date,
    @Query('createdBefore', new ValidationPipe({ transform: true }))
    createdBefore?: Date,
    @Query('updatedAfter', new ValidationPipe({ transform: true }))
    updatedAfter?: Date,
    @Query('updatedBefore', new ValidationPipe({ transform: true }))
    updatedBefore?: Date,
  ): Promise<PaginatedResult<ExpensesOther>> {
    const queryOptions: ExpensesOtherQueryDto = {
      offset: (page - 1) * limit,
      page,
      limit,
      orderBy,
      orderDir,
      name,
      searchTerm,
      createdAfter,
      createdBefore,
      updatedAfter,
      updatedBefore,
    };

    return this.expensesOtherService.findAll(queryOptions);
  }

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number): Promise<ExpensesOther> {
    return this.expensesOtherService.findById(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateExpensesOtherDto: UpdateExpensesOtherDto,
  ): Promise<ExpensesOther> {
    return this.expensesOtherService.update(id, updateExpensesOtherDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.expensesOtherService.remove(id);
  }
}
