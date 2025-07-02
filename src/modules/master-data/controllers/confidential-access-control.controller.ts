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
import { ConfidentialAccessControlService } from '../services/confidential-access-control.service';
import { CreateConfidentialAccessControlDto } from '../dto/create-confidential-access-control.dto';
import { UpdateConfidentialAccessControlDto } from '../dto/update-confidential-access-control.dto';
import { ConfidentialAccessControlQueryDto } from '../dto/confidential-access-control-query.dto';
import { PaginatedResult } from '@common/interfaces/pagination.interface';
import { ConfidentialAccessControl } from '../entities/confidential-access-control.entity';
import { ApiQuery, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Master Data')
@Controller('master-data/confidential-access-control')
export class ConfidentialAccessControlController {
  constructor(private readonly confidentialAccessControlService: ConfidentialAccessControlService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new confidential access control' })
  @ApiResponse({ status: 201, description: 'Confidential access control successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  create(@Body() createConfidentialAccessControlDto: CreateConfidentialAccessControlDto) {
    return this.confidentialAccessControlService.create(createConfidentialAccessControlDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all confidential access controls with pagination' })
  @ApiResponse({ status: 200, description: 'Returns list of confidential access controls.' })
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
    name: 'position',
    type: String,
    required: false,
    description: 'Position title',
  })
  @ApiQuery({
    name: 'confidentialLevel',
    type: String,
    required: false,
    description: 'Confidential level',
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
    @Query('orderBy') orderBy?: ConfidentialAccessControlQueryDto['orderBy'],
    @Query('orderDir') orderDir?: 'ASC' | 'DESC',
    @Query('position') position?: string,
    @Query('confidentialLevel') confidentialLevel?: string,
    @Query('searchTerm') searchTerm?: string,
    @Query('createdAfter', new ValidationPipe({ transform: true })) createdAfter?: Date,
    @Query('createdBefore', new ValidationPipe({ transform: true })) createdBefore?: Date,
    @Query('updatedAfter', new ValidationPipe({ transform: true })) updatedAfter?: Date,
    @Query('updatedBefore', new ValidationPipe({ transform: true })) updatedBefore?: Date,
  ) {
    const queryOptions: ConfidentialAccessControlQueryDto = {
      page,
      limit,
      orderBy,
      orderDir,
      position,
      confidentialLevel: confidentialLevel as any,
      searchTerm,
      createdAfter,
      createdBefore,
      updatedAfter,
      updatedBefore,
    };

    return this.confidentialAccessControlService.findAll(queryOptions);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a confidential access control by ID' })
  @ApiResponse({ status: 200, description: 'Returns a confidential access control.' })
  @ApiResponse({ status: 404, description: 'Confidential access control not found.' })
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.confidentialAccessControlService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a confidential access control' })
  @ApiResponse({ status: 200, description: 'Confidential access control successfully updated.' })
  @ApiResponse({ status: 404, description: 'Confidential access control not found.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateConfidentialAccessControlDto: UpdateConfidentialAccessControlDto,
  ) {
    return this.confidentialAccessControlService.update(id, updateConfidentialAccessControlDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a confidential access control' })
  @ApiResponse({ status: 204, description: 'Confidential access control successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Confidential access control not found.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.confidentialAccessControlService.remove(id);
  }
} 