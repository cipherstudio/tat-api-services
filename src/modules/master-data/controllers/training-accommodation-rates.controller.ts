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
import { TrainingAccommodationRatesService } from '../services/training-accommodation-rates.service';
import { CreateTrainingAccommodationRatesDto } from '../dto/create-training-accommodation-rates.dto';
import { UpdateTrainingAccommodationRatesDto } from '../dto/update-training-accommodation-rates.dto';
import { TrainingAccommodationRatesQueryDto } from '../dto/training-accommodation-rates-query.dto';
import { PaginatedResult } from '../../../common/interfaces/pagination.interface';
import { TrainingAccommodationRates } from '../entities/training-accommodation-rates.entity';

@ApiTags('Master Data')
@Controller('master-data/training-accommodation-rates')
export class TrainingAccommodationRatesController {
  constructor(
    private readonly trainingAccommodationRatesService: TrainingAccommodationRatesService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new training accommodation rate' })
  @ApiResponse({
    status: 201,
    description: 'The training accommodation rate has been successfully created.',
    type: TrainingAccommodationRates,
  })
  create(
    @Body() createTrainingAccommodationRatesDto: CreateTrainingAccommodationRatesDto,
  ): Promise<TrainingAccommodationRates> {
    return this.trainingAccommodationRatesService.create(createTrainingAccommodationRatesDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all training accommodation rates with pagination and filters',
  })
  @ApiResponse({
    status: 200,
    description: 'Return all training accommodation rates.',
    type: [TrainingAccommodationRates],
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
    name: 'travelType',
    type: String,
    required: false,
    description: 'Travel type (DOMESTIC/INTERNATIONAL)',
  })
  @ApiQuery({
    name: 'trainingType',
    type: String,
    required: false,
    description: 'Training type (type-a/type-b/outsider)',
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
    @Query('orderBy') orderBy?: TrainingAccommodationRatesQueryDto['orderBy'],
    @Query('orderDir') orderDir?: 'ASC' | 'DESC',
    @Query('travelType') travelType?: 'DOMESTIC' | 'INTERNATIONAL',
    @Query('trainingType') trainingType?: 'type-a' | 'type-b' | 'outsider',
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
    const queryOptions: TrainingAccommodationRatesQueryDto = {
      page,
      limit,
      orderBy,
      orderDir,
      travelType,
      trainingType,
      searchTerm,
      createdAfter,
      createdBefore,
      updatedAfter,
      updatedBefore,
    };

    return this.trainingAccommodationRatesService.findAll(queryOptions);
  }

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number): Promise<TrainingAccommodationRates> {
    return this.trainingAccommodationRatesService.findById(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTrainingAccommodationRatesDto: UpdateTrainingAccommodationRatesDto,
  ): Promise<TrainingAccommodationRates> {
    return this.trainingAccommodationRatesService.update(
      id,
      updateTrainingAccommodationRatesDto,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.trainingAccommodationRatesService.remove(id);
  }
}
