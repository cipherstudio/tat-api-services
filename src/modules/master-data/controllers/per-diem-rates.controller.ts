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
import { PerDiemRatesService } from '../services/per-diem-rates.service';
import { CreatePerDiemRatesDto } from '../dto/create-per-diem-rates.dto';
import { UpdatePerDiemRatesDto } from '../dto/update-per-diem-rates.dto';
import { PerDiemRatesQueryDto } from '../dto/per-diem-rates-query.dto';
import { PaginatedResult } from '@common/interfaces/pagination.interface';
import { PerDiemRates } from '../entities/per-diem-rates.entity';

@ApiTags('Master Data')
@Controller('master-data/per-diem-rates')
export class PerDiemRatesController {
  constructor(private readonly perDiemRatesService: PerDiemRatesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new per diem rate' })
  @ApiResponse({
    status: 201,
    description: 'The per diem rate has been successfully created.',
    type: PerDiemRates,
  })
  create(
    @Body() createPerDiemRatesDto: CreatePerDiemRatesDto,
  ): Promise<PerDiemRates> {
    return this.perDiemRatesService.create(createPerDiemRatesDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all per diem rates with pagination and filters',
  })
  @ApiResponse({
    status: 200,
    description: 'Return all per diem rates.',
    type: [PerDiemRates],
  })
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
    name: 'positionGroup',
    type: String,
    required: false,
    description: 'Position group',
  })
  @ApiQuery({
    name: 'positionName',
    type: String,
    required: false,
    description: 'Position name',
  })
  @ApiQuery({
    name: 'levelCodeStart',
    type: Number,
    required: false,
    description: 'Level code start',
  })
  @ApiQuery({
    name: 'levelCodeEnd',
    type: Number,
    required: false,
    description: 'Level code end',
  })
  @ApiQuery({
    name: 'areaType',
    type: String,
    required: false,
    description: 'Area type (IN / OUT / ABROAD)',
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
    @Query(new ValidationPipe({ transform: true })) query: PerDiemRatesQueryDto,
  ): Promise<PaginatedResult<PerDiemRates>> {
    return this.perDiemRatesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a per diem rate by id' })
  @ApiResponse({
    status: 200,
    description: 'Return the per diem rate.',
    type: PerDiemRates,
  })
  @ApiResponse({ status: 404, description: 'Per diem rate not found.' })
  findById(@Param('id', ParseIntPipe) id: number): Promise<PerDiemRates> {
    return this.perDiemRatesService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a per diem rate' })
  @ApiResponse({
    status: 200,
    description: 'The per diem rate has been successfully updated.',
    type: PerDiemRates,
  })
  @ApiResponse({ status: 404, description: 'Per diem rate not found.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePerDiemRatesDto: UpdatePerDiemRatesDto,
  ): Promise<PerDiemRates> {
    return this.perDiemRatesService.update(id, updatePerDiemRatesDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a per diem rate' })
  @ApiResponse({
    status: 204,
    description: 'The per diem rate has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Per diem rate not found.' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.perDiemRatesService.remove(id);
  }

  @Get('level-code/:levelCode')
  @ApiOperation({ summary: 'Get per diem rates by level code' })
  @ApiResponse({
    status: 200,
    description: 'Return the per diem rates by level code.',
    type: [PerDiemRates],
  })
  findByLevelCode(
    @Param('levelCode') levelCode?: string,
  ): Promise<PerDiemRates[]> {
    return this.perDiemRatesService.findByLevelCode(levelCode);
  }
}
