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
import { AccommodationRatesService } from '../services/accommodation-rates.service';
import { CreateAccommodationRatesDto } from '../dto/create-accommodation-rates.dto';
import { UpdateAccommodationRatesDto } from '../dto/update-accommodation-rates.dto';
import { AccommodationRatesQueryDto } from '../dto/accommodation-rates-query.dto';
import { PaginatedResult } from '../../../common/interfaces/pagination.interface';
import { AccommodationRates } from '../entities/accommodation-rates.entity';

@ApiTags('Master Data')
@Controller('master-data/accommodation-rates')
export class AccommodationRatesController {
  constructor(private readonly accommodationRatesService: AccommodationRatesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new accommodation rate' })
  @ApiResponse({ status: 201, description: 'The accommodation rate has been successfully created.', type: AccommodationRates })
  create(@Body() createAccommodationRatesDto: CreateAccommodationRatesDto): Promise<AccommodationRates> {
    return this.accommodationRatesService.create(createAccommodationRatesDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all accommodation rates with pagination and filters' })
  @ApiResponse({ status: 200, description: 'Return all accommodation rates.', type: [AccommodationRates] })
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
    name: 'travelType',
    type: String,
    required: false,
    description: 'Travel type (DOMESTIC/INTERNATIONAL)',
  })
  @ApiQuery({
    name: 'positionName',
    type: String,
    required: false,
    description: 'Position name',
  })
  @ApiQuery({
    name: 'levelCodeStart',
    type: String,
    required: false,
    description: 'Level code start',
  })
  @ApiQuery({
    name: 'levelCodeEnd',
    type: String,
    required: false,
    description: 'Level code end',
  })
  @ApiQuery({
    name: 'positionGroupName',
    type: String,
    required: false,
    description: 'Position group name',
  })
  @ApiQuery({
    name: 'rateMode',
    type: String,
    required: false,
    description: 'Rate mode (CHOICE/ACTUAL_ONLY/UNLIMITED)',
  })
  @ApiQuery({
    name: 'countryType',
    type: String,
    required: false,
    description: 'Country type (A/B)',
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
    @Query('orderBy') orderBy?: AccommodationRatesQueryDto['orderBy'],
    @Query('orderDir') orderDir?: 'ASC' | 'DESC',
    @Query('travelType') travelType?: 'DOMESTIC' | 'INTERNATIONAL',
    @Query('positionName') positionName?: string,
    @Query('levelCodeStart') levelCodeStart?: string,
    @Query('levelCodeEnd') levelCodeEnd?: string,
    @Query('positionGroupName') positionGroupName?: string,
    @Query('rateMode') rateMode?: 'CHOICE' | 'ACTUAL_ONLY' | 'UNLIMITED',
    @Query('countryType') countryType?: 'A' | 'B',
    @Query('searchTerm') searchTerm?: string,
    @Query('createdAfter', new ValidationPipe({ transform: true })) createdAfter?: Date,
    @Query('createdBefore', new ValidationPipe({ transform: true })) createdBefore?: Date,
    @Query('updatedAfter', new ValidationPipe({ transform: true })) updatedAfter?: Date,
    @Query('updatedBefore', new ValidationPipe({ transform: true })) updatedBefore?: Date,
  ) {
    const queryOptions: AccommodationRatesQueryDto = {
      page,
      limit,
      orderBy,
      orderDir,
      travelType,
      positionName,
      levelCodeStart,
      levelCodeEnd,
      positionGroupName,
      rateMode,
      countryType,
      searchTerm,
      createdAfter,
      createdBefore,
      updatedAfter,
      updatedBefore,
    };

    return this.accommodationRatesService.findAll(queryOptions);
  }

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number): Promise<AccommodationRates> {
    return this.accommodationRatesService.findById(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAccommodationRatesDto: UpdateAccommodationRatesDto,
  ): Promise<AccommodationRates> {
    return this.accommodationRatesService.update(id, updateAccommodationRatesDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.accommodationRatesService.remove(id);
  }
} 