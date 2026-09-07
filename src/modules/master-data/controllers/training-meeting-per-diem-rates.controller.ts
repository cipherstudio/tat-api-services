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
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { TrainingMeetingPerDiemRatesService } from '../services/training-meeting-per-diem-rates.service';
import { CreateTrainingMeetingPerDiemRatesDto } from '../dto/create-training-meeting-per-diem-rates.dto';
import { UpdateTrainingMeetingPerDiemRatesDto } from '../dto/update-training-meeting-per-diem-rates.dto';
import { TrainingMeetingPerDiemRatesQueryDto } from '../dto/training-meeting-per-diem-rates-query.dto';
import { PaginatedResult } from '@common/interfaces/pagination.interface';
import { TrainingMeetingPerDiemRates } from '../entities/training-meeting-per-diem-rates.entity';

@ApiTags('Master Data')
@Controller('master-data/training-meeting-per-diem-rates')
@UseGuards(JwtAuthGuard)
export class TrainingMeetingPerDiemRatesController {
  constructor(
    private readonly trainingMeetingPerDiemRatesService: TrainingMeetingPerDiemRatesService,
  ) {}

  @UseGuards(AdminGuard)
  @Post()
  @ApiOperation({ summary: 'Create a new training/meeting per diem rate' })
  @ApiResponse({
    status: 201,
    description: 'The rate has been successfully created.',
    type: TrainingMeetingPerDiemRates,
  })
  create(
    @Body() createDto: CreateTrainingMeetingPerDiemRatesDto,
  ): Promise<TrainingMeetingPerDiemRates> {
    return this.trainingMeetingPerDiemRatesService.create(createDto);
  }

  @Get()
  @ApiOperation({
    summary:
      'Get all training/meeting per diem rates with pagination and filters',
  })
  @ApiResponse({
    status: 200,
    description: 'Return all training/meeting per diem rates.',
    type: [TrainingMeetingPerDiemRates],
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
    name: 'rateType',
    type: String,
    required: false,
    description: 'Rate type (TRAINING / MEETING)',
  })
  @ApiQuery({
    name: 'positionGroup',
    type: String,
    required: false,
    description: 'Position group',
  })
  @ApiQuery({
    name: 'positionName',
    type: String,
    required: false,
    description: 'Position name',
  })
  @ApiQuery({
    name: 'levelCodeStart',
    type: String,
    required: false,
    description: 'Level code start',
  })
  @ApiQuery({
    name: 'levelCodeEnd',
    type: String,
    required: false,
    description: 'Level code end',
  })
  @ApiQuery({
    name: 'areaType',
    type: String,
    required: false,
    description: 'Area type (IN / OUT / ABROAD)',
  })
  @ApiQuery({
    name: 'searchTerm',
    type: String,
    required: false,
    description: 'Search term',
  })
  findAll(
    @Query(new ValidationPipe({ transform: true }))
    query: TrainingMeetingPerDiemRatesQueryDto,
  ): Promise<PaginatedResult<TrainingMeetingPerDiemRates>> {
    return this.trainingMeetingPerDiemRatesService.findAll(query);
  }

  @Get('level-code/:levelCode')
  @ApiOperation({
    summary: 'Get training/meeting per diem rates by level code',
  })
  @ApiResponse({
    status: 200,
    description: 'Return the rates by level code.',
    type: [TrainingMeetingPerDiemRates],
  })
  @ApiQuery({
    name: 'rateType',
    type: String,
    required: false,
    description: 'Rate type (TRAINING / MEETING)',
  })
  findByLevelCode(
    @Param('levelCode') levelCode?: string,
    @Query('rateType') rateType?: 'TRAINING' | 'MEETING',
  ): Promise<TrainingMeetingPerDiemRates[]> {
    return this.trainingMeetingPerDiemRatesService.findByLevelCode(
      levelCode,
      rateType,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a training/meeting per diem rate by id' })
  @ApiResponse({
    status: 200,
    description: 'Return the rate.',
    type: TrainingMeetingPerDiemRates,
  })
  @ApiResponse({ status: 404, description: 'Rate not found.' })
  findById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<TrainingMeetingPerDiemRates> {
    return this.trainingMeetingPerDiemRatesService.findById(id);
  }

  @UseGuards(AdminGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a training/meeting per diem rate' })
  @ApiResponse({
    status: 200,
    description: 'The rate has been successfully updated.',
    type: TrainingMeetingPerDiemRates,
  })
  @ApiResponse({ status: 404, description: 'Rate not found.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateTrainingMeetingPerDiemRatesDto,
  ): Promise<TrainingMeetingPerDiemRates> {
    return this.trainingMeetingPerDiemRatesService.update(id, updateDto);
  }

  @UseGuards(AdminGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a training/meeting per diem rate' })
  @ApiResponse({
    status: 204,
    description: 'The rate has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Rate not found.' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.trainingMeetingPerDiemRatesService.remove(id);
  }
}
