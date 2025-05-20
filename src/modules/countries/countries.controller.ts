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
  Version,
} from '@nestjs/common';
import { CountriesService } from './countries.service';
import { CreateCountriesDto } from './dto/create-countries.dto';
import { UpdateCountriesDto } from './dto/update-countries.dto';
import { QueryCountriesDto } from './dto/query-countries.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('countries')
@Controller({
  path: 'countries',
  version: '1'
})
export class CountriesController {
  constructor(private readonly countriesService: CountriesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new country' })
  @ApiResponse({ status: 201, description: 'The country has been successfully created.' })
  create(@Body() createCountriesDto: CreateCountriesDto) {
    return this.countriesService.create(createCountriesDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all countries with pagination' })
  @ApiResponse({ status: 200, description: 'Return all countries with pagination.' })
  findAll(@Query() query: QueryCountriesDto) {
    return this.countriesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a country by id' })
  @ApiResponse({ status: 200, description: 'Return the country.' })
  @ApiResponse({ status: 404, description: 'Country not found.' })
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.countriesService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a country' })
  @ApiResponse({ status: 200, description: 'The country has been successfully updated.' })
  @ApiResponse({ status: 404, description: 'Country not found.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCountriesDto: UpdateCountriesDto,
  ) {
    return this.countriesService.update(id, updateCountriesDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a country' })
  @ApiResponse({ status: 204, description: 'The country has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Country not found.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.countriesService.remove(id);
  }
}
