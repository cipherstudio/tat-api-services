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
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { MeetRateService } from '../services/meet-rate.service';
import { CreateMeetRateDto } from '../dto/create-meet-rate.dto';
import { UpdateMeetRateDto } from '../dto/update-meet-rate.dto';
import { MeetRateQueryDto } from '../dto/meet-rate-query.dto';
import { PaginatedResult } from '../../../common/interfaces/pagination.interface';
import { MeetRate } from '../entities/meet-rate.entity';

@ApiTags('Master Data')
@Controller('master-data/meet-rate')
export class MeetRateController {
  constructor(
    private readonly meetRateService: MeetRateService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new meet rate' })
  @ApiResponse({
    status: 201,
    description: 'The meet rate has been successfully created.',
    type: MeetRate,
  })
  create(
    @Body() createMeetRateDto: CreateMeetRateDto,
  ): Promise<MeetRate> {
    return this.meetRateService.create(createMeetRateDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all meet rates with pagination and filters',
  })
  @ApiResponse({
    status: 200,
    description: 'Return all meet rates.',
    type: [MeetRate],
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
    name: 'type',
    type: String,
    required: false,
    description: 'Meeting type',
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
    @Query('orderBy') orderBy?: MeetRateQueryDto['orderBy'],
    @Query('orderDir') orderDir?: 'ASC' | 'DESC',
    @Query('type') type?: string,
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
    const queryOptions: MeetRateQueryDto = {
      page,
      limit,
      orderBy,
      orderDir,
      type,
      searchTerm,
      createdAfter,
      createdBefore,
      updatedAfter,
      updatedBefore,
    };

    return this.meetRateService.findAll(queryOptions);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a meet rate by ID' })
  @ApiResponse({
    status: 200,
    description: 'Return the meet rate.',
    type: MeetRate,
  })
  findById(@Param('id', ParseIntPipe) id: number): Promise<MeetRate> {
    return this.meetRateService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a meet rate' })
  @ApiResponse({
    status: 200,
    description: 'The meet rate has been successfully updated.',
    type: MeetRate,
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMeetRateDto: UpdateMeetRateDto,
  ): Promise<MeetRate> {
    return this.meetRateService.update(
      id,
      updateMeetRateDto,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a meet rate' })
  @ApiResponse({
    status: 204,
    description: 'The meet rate has been successfully deleted.',
  })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.meetRateService.remove(id);
  }
}
