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
import { PrivilegeService } from '../services/privilege.service.js';
import { Privilege } from '../entities/privilege.entity.js';
import { CreatePrivilegeDto, UpdatePrivilegeDto } from '../dto/privilege.dto.js';

@ApiTags('Master Data')
@Controller('master-data/privileges')
export class PrivilegeController {
  constructor(private readonly privilegeService: PrivilegeService) {}

  @Post()
  create(@Body() createPrivilegeDto: CreatePrivilegeDto): Promise<Privilege> {
    return this.privilegeService.create(createPrivilegeDto);
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
  @ApiQuery({
    name: 'isCommitteePosition',
    type: Boolean,
    required: false,
    description: 'Filter by committee position status',
  })
  @ApiQuery({
    name: 'isOutsiderEquivalent',
    type: Boolean,
    required: false,
    description: 'Filter by outsider equivalent status',
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
    @Query('isCommitteePosition', new ValidationPipe({ transform: true })) isCommitteePosition?: boolean,
    @Query('isOutsiderEquivalent', new ValidationPipe({ transform: true })) isOutsiderEquivalent?: boolean,
  ) {
    return this.privilegeService.findAll({
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
      isCommitteePosition,
      isOutsiderEquivalent,
    });
  }

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number): Promise<Privilege> {
    return this.privilegeService.findById(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePrivilegeDto: UpdatePrivilegeDto,
  ): Promise<Privilege> {
    return this.privilegeService.update(id, updatePrivilegeDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.privilegeService.delete(id);
  }
} 