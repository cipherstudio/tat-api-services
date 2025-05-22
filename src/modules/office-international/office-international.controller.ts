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
import { OfficeInternationalService } from './office-international.service.js';
import { CreateOfficeInternationalDto } from './dto/create-office-international.dto.js';
import { UpdateOfficeInternationalDto } from './dto/update-office-international.dto.js';
import { OfficeInternational } from './entities/office-international.entity.js';
import { OfficeInternationalQueryOptions } from './interfaces/office-international-options.interface.js';
import { PaginatedResult } from '@common/interfaces/pagination.interface.js';
import { ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('Office International')
@Controller('office-internationals')
export class OfficeInternationalController {
  constructor(private readonly officeInternationalService: OfficeInternationalService) {}

  @Post()
  create(@Body() createOfficeInternationalDto: CreateOfficeInternationalDto): Promise<OfficeInternational> {
    return this.officeInternationalService.create(createOfficeInternationalDto);
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
    name: 'name',
    type: String,
    required: false,
    description: 'Name',
  })
  @ApiQuery({
    name: 'region',
    type: String,
    required: false,
    description: 'Region',
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
    @Query('orderBy') orderBy?: OfficeInternationalQueryOptions['orderBy'],
    @Query('orderDir') orderDir?: 'ASC' | 'DESC',
    @Query('name') name?: string,
    @Query('region') region?: string,
    @Query('searchTerm') searchTerm?: string,
    @Query('createdAfter', new ValidationPipe({ transform: true })) createdAfter?: Date,
    @Query('createdBefore', new ValidationPipe({ transform: true })) createdBefore?: Date,
    @Query('updatedAfter', new ValidationPipe({ transform: true })) updatedAfter?: Date,
    @Query('updatedBefore', new ValidationPipe({ transform: true })) updatedBefore?: Date,
  ): Promise<PaginatedResult<OfficeInternational>> {
    const queryOptions: OfficeInternationalQueryOptions = {
      page,
      limit,
      orderBy,
      orderDir,
      name,
      region,
      searchTerm,
      createdAfter,
      createdBefore,
      updatedAfter,
      updatedBefore,
    };

    return this.officeInternationalService.findAll(queryOptions);
  }

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number): Promise<OfficeInternational> {
    return this.officeInternationalService.findById(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOfficeInternationalDto: UpdateOfficeInternationalDto,
  ): Promise<OfficeInternational> {
    return this.officeInternationalService.update(id, updateOfficeInternationalDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.officeInternationalService.remove(id);
  }
}
