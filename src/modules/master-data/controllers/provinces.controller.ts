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
import { ProvincesService } from '../services/provinces.service';
import { CreateProvincesDto } from '../dto/create-provinces.dto';
import { UpdateProvincesDto } from '../dto/update-provinces.dto';
import { ProvincesQueryDto } from '../dto/provinces-query.dto';
import { PaginatedResult } from '@common/interfaces/pagination.interface';
import { Provinces } from '../entities/provinces.entity';
import { ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('Master Data')
@Controller('master-data/provinces')
export class ProvincesController {
  constructor(private readonly provincesService: ProvincesService) {}

  @Post()
  create(@Body() createProvincesDto: CreateProvincesDto) {
    return this.provincesService.create(createProvincesDto);
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
    name: 'nameEn',
    type: String,
    required: false,
    description: 'Name in English',
  })
  @ApiQuery({
    name: 'nameTh',
    type: String,
    required: false,
    description: 'Name in Thai',
  })
  @ApiQuery({
    name: 'isPerimeter',
    type: Boolean,
    required: false,
    description: 'Filter by perimeter status',
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
    @Query('orderBy') orderBy?: ProvincesQueryDto['orderBy'],
    @Query('orderDir') orderDir?: 'ASC' | 'DESC',
    @Query('nameEn') nameEn?: string,
    @Query('nameTh') nameTh?: string,
    @Query('isPerimeter', new ValidationPipe({ transform: true })) isPerimeter?: boolean,
    @Query('searchTerm') searchTerm?: string,
    @Query('createdAfter', new ValidationPipe({ transform: true })) createdAfter?: Date,
    @Query('createdBefore', new ValidationPipe({ transform: true })) createdBefore?: Date,
    @Query('updatedAfter', new ValidationPipe({ transform: true })) updatedAfter?: Date,
    @Query('updatedBefore', new ValidationPipe({ transform: true })) updatedBefore?: Date,
  ) {
    const queryOptions: ProvincesQueryDto = {
      page,
      limit,
      orderBy,
      orderDir,
      nameEn,
      nameTh,
      isPerimeter,
      searchTerm,
      createdAfter,
      createdBefore,
      updatedAfter,
      updatedBefore,
    };

    return this.provincesService.findAll(queryOptions);
  }

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.provincesService.findById(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProvincesDto: UpdateProvincesDto,
  ) {
    return this.provincesService.update(id, updateProvincesDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.provincesService.remove(id);
  }
} 