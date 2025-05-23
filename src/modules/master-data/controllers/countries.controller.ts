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
import { CountriesService } from '../services/countries.service';
import { CreateCountriesDto } from '../dto/create-countries.dto';
import { UpdateCountriesDto } from '../dto/update-countries.dto';
import { CountriesQueryDto } from '../dto/countries-query.dto';
import { PaginatedResult } from '@common/interfaces/pagination.interface';
import { Countries } from '../entities/countries.entity';
import { ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('Master Data')
@Controller('master-data/countries')
export class CountriesController {
  constructor(private readonly countriesService: CountriesService) {}

  @Post()
  create(@Body() createCountriesDto: CreateCountriesDto) {
    return this.countriesService.create(createCountriesDto);
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
    name: 'code',
    type: String,
    required: false,
    description: 'Code',
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
    @Query('orderBy') orderBy?: CountriesQueryDto['orderBy'],
    @Query('orderDir') orderDir?: 'ASC' | 'DESC',
    @Query('nameEn') nameEn?: string,
    @Query('nameTh') nameTh?: string,
    @Query('code') code?: string,
    @Query('searchTerm') searchTerm?: string,
    @Query('createdAfter', new ValidationPipe({ transform: true })) createdAfter?: Date,
    @Query('createdBefore', new ValidationPipe({ transform: true })) createdBefore?: Date,
    @Query('updatedAfter', new ValidationPipe({ transform: true })) updatedAfter?: Date,
    @Query('updatedBefore', new ValidationPipe({ transform: true })) updatedBefore?: Date,
  ) {
    const queryOptions: CountriesQueryDto = {
      page,
      limit,
      orderBy,
      orderDir,
      nameEn,
      nameTh,
      code,
      searchTerm,
      createdAfter,
      createdBefore,
      updatedAfter,
      updatedBefore,
    };

    return this.countriesService.findAll(queryOptions);
  }

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.countriesService.findById(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCountriesDto: UpdateCountriesDto,
  ) {
    return this.countriesService.update(id, updateCountriesDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.countriesService.remove(id);
  }
}
