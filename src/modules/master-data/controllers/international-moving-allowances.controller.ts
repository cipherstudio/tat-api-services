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
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { InternationalMovingAllowancesService } from '../services/international-moving-allowances.service';
import { CreateInternationalMovingAllowancesDto } from '../dto/create-international-moving-allowances.dto';
import { UpdateInternationalMovingAllowancesDto } from '../dto/update-international-moving-allowances.dto';
import { InternationalMovingAllowancesQueryDto } from '../dto/international-moving-allowances-query.dto';
import { PaginatedResult } from '../../../common/interfaces/pagination.interface';
import { InternationalMovingAllowances } from '../entities/international-moving-allowances.entity';

@ApiTags('Master Data')
@Controller('master-data/international-moving-allowances')
export class InternationalMovingAllowancesController {
  constructor(private readonly internationalMovingAllowancesService: InternationalMovingAllowancesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new international moving allowance' })
  @ApiResponse({ status: 201, description: 'The international moving allowance has been successfully created.', type: InternationalMovingAllowances })
  create(@Body() createDto: CreateInternationalMovingAllowancesDto): Promise<InternationalMovingAllowances> {
    return this.internationalMovingAllowancesService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all international moving allowances with pagination and filters' })
  @ApiResponse({ status: 200, description: 'Return all international moving allowances.', type: [InternationalMovingAllowances] })
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
    name: 'office',
    type: String,
    required: false,
    description: 'Office name',
  })
  @ApiQuery({
    name: 'currency',
    type: String,
    required: false,
    description: 'Currency',
  })
  @ApiQuery({
    name: 'directorSalary',
    type: Number,
    required: false,
    description: 'Director salary',
  })
  @ApiQuery({
    name: 'deputyDirectorSalary',
    type: Number,
    required: false,
    description: 'Deputy director salary',
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
    @Query('orderBy') orderBy?: InternationalMovingAllowancesQueryDto['orderBy'],
    @Query('orderDir') orderDir?: 'ASC' | 'DESC',
    @Query('office') office?: string,
    @Query('currency') currency?: string,
    @Query('directorSalary', new ValidationPipe({ transform: true })) directorSalary?: number,
    @Query('deputyDirectorSalary', new ValidationPipe({ transform: true })) deputyDirectorSalary?: number,
    @Query('createdAfter', new ValidationPipe({ transform: true })) createdAfter?: Date,
    @Query('createdBefore', new ValidationPipe({ transform: true })) createdBefore?: Date,
    @Query('updatedAfter', new ValidationPipe({ transform: true })) updatedAfter?: Date,
    @Query('updatedBefore', new ValidationPipe({ transform: true })) updatedBefore?: Date,
  ) {
    const queryOptions: InternationalMovingAllowancesQueryDto = {
      page,
      limit,
      orderBy,
      orderDir,
      office,
      currency,
      directorSalary,
      deputyDirectorSalary,
      createdAfter,
      createdBefore,
      updatedAfter,
      updatedBefore,
    };

    return this.internationalMovingAllowancesService.findAll(queryOptions);
  }

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number): Promise<InternationalMovingAllowances> {
    return this.internationalMovingAllowancesService.findById(id);
  }

  @Get('office/:office')
  findByOffice(@Param('office') office: string): Promise<InternationalMovingAllowances | undefined> {
    return this.internationalMovingAllowancesService.findByOffice(office);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateInternationalMovingAllowancesDto,
  ): Promise<InternationalMovingAllowances> {
    return this.internationalMovingAllowancesService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.internationalMovingAllowancesService.remove(id);
  }
} 