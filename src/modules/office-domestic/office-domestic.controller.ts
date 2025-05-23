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
import { OfficeDomesticService } from './office-domestic.service.js';
import { CreateOfficeDomesticDto } from './dto/create-office-domestic.dto.js';
import { UpdateOfficeDomesticDto } from './dto/update-office-domestic.dto.js';
import { OfficeDomestic } from './entities/office-domestic.entity.js';
import { OfficeDomesticQueryOptions } from './interfaces/office-domestic-options.interface.js';
import { PaginatedResult } from '@common/interfaces/pagination.interface.js';
import { ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('Office Domestic')
@Controller('office-domestics')
export class OfficeDomesticController {
  constructor(private readonly officeDomesticService: OfficeDomesticService) {}

  @Post()
  create(@Body() createOfficeDomesticDto: CreateOfficeDomesticDto): Promise<OfficeDomestic> {
    return this.officeDomesticService.create(createOfficeDomesticDto);
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
    name: 'isHeadOffice',
    type: Boolean,
    required: false,
    description: 'Whether this is a head office',
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
    @Query('orderBy') orderBy?: OfficeDomesticQueryOptions['orderBy'],
    @Query('orderDir') orderDir?: 'ASC' | 'DESC',
    @Query('name') name?: string,
    @Query('region') region?: string,
    @Query('isHeadOffice', new ValidationPipe({ transform: true })) isHeadOffice?: boolean,
    @Query('searchTerm') searchTerm?: string,
    @Query('createdAfter', new ValidationPipe({ transform: true })) createdAfter?: Date,
    @Query('createdBefore', new ValidationPipe({ transform: true })) createdBefore?: Date,
    @Query('updatedAfter', new ValidationPipe({ transform: true })) updatedAfter?: Date,
    @Query('updatedBefore', new ValidationPipe({ transform: true })) updatedBefore?: Date,
  ): Promise<PaginatedResult<OfficeDomestic>> {
    const queryOptions: OfficeDomesticQueryOptions = {
      page,
      limit,
      orderBy,
      orderDir,
      name,
      region,
      isHeadOffice,
      searchTerm,
      createdAfter,
      createdBefore,
      updatedAfter,
      updatedBefore,
    };

    return this.officeDomesticService.findAll(queryOptions);
  }

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number): Promise<OfficeDomestic> {
    return this.officeDomesticService.findById(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOfficeDomesticDto: UpdateOfficeDomesticDto,
  ): Promise<OfficeDomestic> {
    return this.officeDomesticService.update(id, updateOfficeDomesticDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.officeDomesticService.remove(id);
  }
} 