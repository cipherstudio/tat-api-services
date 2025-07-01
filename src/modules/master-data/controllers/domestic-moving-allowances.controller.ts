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
import { DomesticMovingAllowancesService } from '../services/domestic-moving-allowances.service';
import { CreateDomesticMovingAllowancesDto } from '../dto/create-domestic-moving-allowances.dto';
import { UpdateDomesticMovingAllowancesDto } from '../dto/update-domestic-moving-allowances.dto';
import { DomesticMovingAllowancesQueryDto } from '../dto/domestic-moving-allowances-query.dto';
import { DomesticMovingAllowances } from '../entities/domestic-moving-allowances.entity';

@ApiTags('Master Data')
@Controller('master-data/domestic-moving-allowances')
export class DomesticMovingAllowancesController {
  constructor(
    private readonly domesticMovingAllowancesService: DomesticMovingAllowancesService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new domestic moving allowance' })
  @ApiResponse({
    status: 201,
    description: 'The domestic moving allowance has been successfully created.',
    type: DomesticMovingAllowances,
  })
  create(
    @Body() createDto: CreateDomesticMovingAllowancesDto,
  ): Promise<DomesticMovingAllowances> {
    return this.domesticMovingAllowancesService.create(createDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all domestic moving allowances with pagination and filters',
  })
  @ApiResponse({
    status: 200,
    description: 'Return all domestic moving allowances.',
    type: [DomesticMovingAllowances],
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
    name: 'distanceStartKm',
    type: Number,
    required: false,
    description: 'Distance start in kilometers',
  })
  @ApiQuery({
    name: 'distanceEndKm',
    type: Number,
    required: false,
    description: 'Distance end in kilometers',
  })
  @ApiQuery({
    name: 'rateBaht',
    type: Number,
    required: false,
    description: 'Rate in Thai Baht',
  })
  @ApiQuery({
    name: 'searchTerm',
    type: String,
    required: false,
    description:
      'Search term for distance (will find records where the distance falls within the range)',
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
    @Query('orderBy') orderBy?: DomesticMovingAllowancesQueryDto['orderBy'],
    @Query('orderDir') orderDir?: 'ASC' | 'DESC',
    @Query('distanceStartKm', new ValidationPipe({ transform: true }))
    distanceStartKm?: number,
    @Query('distanceEndKm', new ValidationPipe({ transform: true }))
    distanceEndKm?: number,
    @Query('rateBaht', new ValidationPipe({ transform: true }))
    rateBaht?: number,
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
    const queryOptions: Partial<DomesticMovingAllowancesQueryDto> = {
      page,
      limit,
      orderBy,
      orderDir,
      distanceStartKm: distanceStartKm ? Number(distanceStartKm) : undefined,
      distanceEndKm: distanceEndKm ? Number(distanceEndKm) : undefined,
      rateBaht: rateBaht ? Number(rateBaht) : undefined,
      searchTerm,
      createdAfter,
      createdBefore,
      updatedAfter,
      updatedBefore,
      offset: 0,
    };

    return this.domesticMovingAllowancesService.findAll(queryOptions);
  }

  @Get(':id')
  findById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<DomesticMovingAllowances> {
    return this.domesticMovingAllowancesService.findById(id);
  }

  @Get('distance/:distance')
  findByDistance(
    @Param('distance', ParseIntPipe) distance: number,
  ): Promise<DomesticMovingAllowances> {
    return this.domesticMovingAllowancesService.findByDistance(distance);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateDomesticMovingAllowancesDto,
  ): Promise<DomesticMovingAllowances> {
    return this.domesticMovingAllowancesService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.domesticMovingAllowancesService.remove(id);
  }
}
