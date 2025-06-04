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
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { OutsiderEquivalentService } from '../services/outsider-equivalent.service.js';
import { OutsiderEquivalent } from '../entities/outsider-equivalent.entity.js';
import { CreateOutsiderEquivalentDto, UpdateOutsiderEquivalentDto } from '../dto/outsider-equivalent.dto.js';

@ApiTags('Master Data')
@Controller('master-data/outsider-equivalents')
export class OutsiderEquivalentController {
  constructor(private readonly outsiderEquivalentService: OutsiderEquivalentService) {}

  @Post()
  create(@Body() createOutsiderEquivalentDto: CreateOutsiderEquivalentDto): Promise<OutsiderEquivalent> {
    return this.outsiderEquivalentService.create(createOutsiderEquivalentDto);
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
    @Query('orderBy') orderBy?: string,
    @Query('orderDir') orderDir?: 'ASC' | 'DESC',
    @Query('name') name?: string,
    @Query('searchTerm') searchTerm?: string,
    @Query('createdAfter', new ValidationPipe({ transform: true })) createdAfter?: Date,
    @Query('createdBefore', new ValidationPipe({ transform: true })) createdBefore?: Date,
    @Query('updatedAfter', new ValidationPipe({ transform: true })) updatedAfter?: Date,
    @Query('updatedBefore', new ValidationPipe({ transform: true })) updatedBefore?: Date,
  ) {
    return this.outsiderEquivalentService.findAll({
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
    });
  }

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number): Promise<OutsiderEquivalent> {
    return this.outsiderEquivalentService.findById(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOutsiderEquivalentDto: UpdateOutsiderEquivalentDto,
  ): Promise<OutsiderEquivalent> {
    return this.outsiderEquivalentService.update(id, updateOutsiderEquivalentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.outsiderEquivalentService.delete(id);
  }
} 