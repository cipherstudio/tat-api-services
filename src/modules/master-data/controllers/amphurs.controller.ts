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
import { AmphursService } from '../services/amphurs.service';
import { CreateAmphursDto } from '../dto/create-amphurs.dto';
import { UpdateAmphursDto } from '../dto/update-amphurs.dto';
import { AmphursQueryDto } from '../dto/amphurs-query.dto';
import { PaginatedResult } from '@common/interfaces/pagination.interface';
import { Amphurs } from '../entities/amphurs.entity';
import { ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('Master Data')
@Controller('master-data/amphurs')
export class AmphursController {
  constructor(private readonly amphursService: AmphursService) {}

  @Post()
  create(@Body() createAmphursDto: CreateAmphursDto) {
    return this.amphursService.create(createAmphursDto);
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
    name: 'provinceId',
    type: Number,
    required: false,
    description: 'Province ID',
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
    @Query('orderBy') orderBy?: AmphursQueryDto['orderBy'],
    @Query('orderDir') orderDir?: 'ASC' | 'DESC',
    @Query('nameEn') nameEn?: string,
    @Query('nameTh') nameTh?: string,
    @Query('provinceId', new ValidationPipe({ transform: true })) provinceId?: number,
    @Query('searchTerm') searchTerm?: string,
    @Query('createdAfter', new ValidationPipe({ transform: true })) createdAfter?: Date,
    @Query('createdBefore', new ValidationPipe({ transform: true })) createdBefore?: Date,
    @Query('updatedAfter', new ValidationPipe({ transform: true })) updatedAfter?: Date,
    @Query('updatedBefore', new ValidationPipe({ transform: true })) updatedBefore?: Date,
  ) {
    const queryOptions: AmphursQueryDto = {
      page,
      limit,
      orderBy,
      orderDir,
      nameEn,
      nameTh,
      provinceId,
      searchTerm,
      createdAfter,
      createdBefore,
      updatedAfter,
      updatedBefore,
    };

    return this.amphursService.findAll(queryOptions);
  }

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.amphursService.findById(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAmphursDto: UpdateAmphursDto,
  ) {
    return this.amphursService.update(id, updateAmphursDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.amphursService.remove(id);
  }
} 