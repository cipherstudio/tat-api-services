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
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { ReportSettingsService } from '../services/report-settings.service';
import { CreateReportSettingsDto } from '../dto/create-report-settings.dto';
import { UpdateReportSettingsDto } from '../dto/update-report-settings.dto';
import { ReportSettingsQueryDto } from '../dto/report-settings-query.dto';
import { PaginatedResult } from '../../../common/interfaces/pagination.interface';
import { ReportSettings } from '../entities/report-settings.entity';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';

@ApiTags('Master Data')
@Controller('master-data/report-settings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ReportSettingsController {
  constructor(
    private readonly reportSettingsService: ReportSettingsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new report setting' })
  @ApiResponse({
    status: 201,
    description: 'The report setting has been successfully created.',
    type: ReportSettings,
  })
  create(
    @Body() createReportSettingsDto: CreateReportSettingsDto,
  ): Promise<ReportSettings> {
    return this.reportSettingsService.create(createReportSettingsDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all report settings with pagination and filters',
  })
  @ApiResponse({
    status: 200,
    description: 'Return all report settings.',
    type: [ReportSettings],
  })
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
    name: 'reportName',
    type: String,
    required: false,
    description: 'Report name',
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
    @Query('orderBy') orderBy?: ReportSettingsQueryDto['orderBy'],
    @Query('orderDir') orderDir?: 'ASC' | 'DESC',
    @Query('reportName') reportName?: string,
    @Query('code') code?: string,
    @Query('searchTerm') searchTerm?: string,
    @Query('createdAfter', new ValidationPipe({ transform: true }))
    createdAfter?: Date,
    @Query('createdBefore', new ValidationPipe({ transform: true }))
    createdBefore?: Date,
    @Query('updatedAfter', new ValidationPipe({ transform: true }))
    updatedAfter?: Date,
    @Query('updatedBefore', new ValidationPipe({ transform: true }))
    updatedBefore?: Date,
  ) {
    const queryOptions: ReportSettingsQueryDto = {
      page,
      limit,
      orderBy,
      orderDir,
      reportName,
      code,
      searchTerm,
      createdAfter,
      createdBefore,
      updatedAfter,
      updatedBefore,
    };

    return this.reportSettingsService.findAll(queryOptions);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a report setting by ID' })
  @ApiResponse({
    status: 200,
    description: 'Return the report setting.',
    type: ReportSettings,
  })
  findById(@Param('id', ParseIntPipe) id: number): Promise<ReportSettings> {
    return this.reportSettingsService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a report setting' })
  @ApiResponse({
    status: 200,
    description: 'The report setting has been successfully updated.',
    type: ReportSettings,
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReportSettingsDto: UpdateReportSettingsDto,
  ): Promise<ReportSettings> {
    return this.reportSettingsService.update(
      id,
      updateReportSettingsDto,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a report setting' })
  @ApiResponse({
    status: 204,
    description: 'The report setting has been successfully deleted.',
  })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.reportSettingsService.remove(id);
  }
}
