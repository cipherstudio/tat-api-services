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
import { PlacesService } from './places.service';
import { CreatePlacesDto } from './dto/create-places.dto';
import { UpdatePlacesDto } from './dto/update-places.dto';
import { Places } from './entities/places.entity';
import { PlacesQueryOptions } from './interfaces/places-options.interface';
import { PaginatedResult } from '@common/interfaces/pagination.interface';

@ApiTags('Places')
@Controller('places')
export class PlacesController {
  constructor(private readonly placesService: PlacesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new place' })
  @ApiResponse({ status: 201, description: 'The place has been successfully created.', type: Places })
  create(@Body() createPlacesDto: CreatePlacesDto): Promise<Places> {
    return this.placesService.create(createPlacesDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all places with pagination and filters' })
  @ApiResponse({ status: 200, description: 'Return all places.', type: [Places] })
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
    @Query('orderBy') orderBy?: PlacesQueryOptions['orderBy'],
    @Query('orderDir') orderDir?: 'ASC' | 'DESC',
    @Query('name') name?: string,
    @Query('searchTerm') searchTerm?: string,
    @Query('createdAfter', new ValidationPipe({ transform: true })) createdAfter?: Date,
    @Query('createdBefore', new ValidationPipe({ transform: true })) createdBefore?: Date,
    @Query('updatedAfter', new ValidationPipe({ transform: true })) updatedAfter?: Date,
    @Query('updatedBefore', new ValidationPipe({ transform: true })) updatedBefore?: Date,
  ): Promise<PaginatedResult<Places>> {
    const queryOptions: PlacesQueryOptions = {
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

    return this.placesService.findAll(queryOptions);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a place by id' })
  @ApiResponse({ status: 200, description: 'Return the place.', type: Places })
  @ApiResponse({ status: 404, description: 'Place not found.' })
  findById(@Param('id', ParseIntPipe) id: number): Promise<Places> {
    return this.placesService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a place' })
  @ApiResponse({ status: 200, description: 'The place has been successfully updated.', type: Places })
  @ApiResponse({ status: 404, description: 'Place not found.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePlacesDto: UpdatePlacesDto,
  ): Promise<Places> {
    return this.placesService.update(id, updatePlacesDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a place' })
  @ApiResponse({ status: 204, description: 'The place has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Place not found.' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.placesService.remove(id);
  }
} 