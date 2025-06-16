import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AttireAllowanceRatesService } from '../services/attire-allowance-rates.service';
import { CreateAttireAllowanceRatesDto } from '../dto/create-attire-allowance-rates.dto';
import { UpdateAttireAllowanceRatesDto } from '../dto/update-attire-allowance-rates.dto';
import { AttireAllowanceRatesQueryDto } from '../dto/attire-allowance-rates-query.dto';
import { AttireAllowanceRates } from '../entities/attire-allowance-rates.entity';
import { PaginatedResult } from '../../../common/interfaces/pagination.interface';

@ApiTags('Master Data')
@Controller('master-data/attire-allowance-rates')
export class AttireAllowanceRatesController {
  constructor(private readonly attireAllowanceRatesService: AttireAllowanceRatesService) {}

  @Post()
  create(@Body() createAttireAllowanceRatesDto: CreateAttireAllowanceRatesDto): Promise<AttireAllowanceRates> {
    return this.attireAllowanceRatesService.create(createAttireAllowanceRatesDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all attire allowance rates with pagination and filters' })
  @ApiResponse({ status: 200, description: 'Return all attire allowance rates.', type: [AttireAllowanceRates] })
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
    name: 'assignmentType',
    type: String,
    required: false,
    description: 'Assignment type',
  })
  @ApiQuery({
    name: 'destinationType',
    type: String,
    required: false,
    description: 'Destination type',
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
    @Query('orderBy') orderBy?: AttireAllowanceRatesQueryDto['orderBy'],
    @Query('orderDir') orderDir?: 'asc' | 'desc',
    @Query('assignmentType') assignmentType?: 'TEMPORARY' | 'PERMANENT',
    @Query('destinationType') destinationType?: 'A' | 'B',
    @Query('searchTerm') searchTerm?: string,
    @Query('createdAfter', new ValidationPipe({ transform: true })) createdAfter?: Date,
    @Query('createdBefore', new ValidationPipe({ transform: true })) createdBefore?: Date,
    @Query('updatedAfter', new ValidationPipe({ transform: true })) updatedAfter?: Date,
    @Query('updatedBefore', new ValidationPipe({ transform: true })) updatedBefore?: Date,
  ) {
    const queryOptions: AttireAllowanceRatesQueryDto = {
      page,
      limit,
      orderBy,
      orderDir,
      assignmentType,
      destinationType,
      searchTerm,
      createdAfter,
      createdBefore,
      updatedAfter,
      updatedBefore,
    };

    return this.attireAllowanceRatesService.findAll(queryOptions);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<AttireAllowanceRates> {
    return this.attireAllowanceRatesService.findById(id);
  }

  @Get('assignment-type/:type')
  findByAssignmentType(@Param('type') type: string): Promise<AttireAllowanceRates[]> {
    return this.attireAllowanceRatesService.findByAssignmentType(type);
  }

  @Get('destination-type/:type')
  findByDestinationType(@Param('type') type: string): Promise<AttireAllowanceRates[]> {
    return this.attireAllowanceRatesService.findByDestinationType(type);
  }

  @Get('level/:level')
  findByLevelRange(@Param('level', ParseIntPipe) level: number): Promise<AttireAllowanceRates[]> {
    return this.attireAllowanceRatesService.findByLevelRange(level);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAttireAllowanceRatesDto: UpdateAttireAllowanceRatesDto,
  ): Promise<AttireAllowanceRates> {
    return this.attireAllowanceRatesService.update(id, updateAttireAllowanceRatesDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.attireAllowanceRatesService.remove(id);
  }
} 