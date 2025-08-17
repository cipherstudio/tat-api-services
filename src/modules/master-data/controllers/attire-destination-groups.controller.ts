import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Query, 
  ParseIntPipe, 
  ValidationPipe,
  ParseArrayPipe 
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiQuery, 
  ApiParam,
  ApiBadRequestResponse,
  ApiNotFoundResponse 
} from '@nestjs/swagger';
import { AttireDestinationGroupsService } from '../services/attire-destination-groups.service';
import { CreateAttireDestinationGroupsDto } from '../dto/create-attire-destination-groups.dto';
import { UpdateAttireDestinationGroupsDto } from '../dto/update-attire-destination-groups.dto';
import { AttireDestinationGroupsQueryDto } from '../dto/attire-destination-groups-query.dto';
import { AttireDestinationGroups } from '../entities/attire-destination-groups.entity';
import { PaginatedResult } from '../../../common/interfaces/pagination.interface';

@ApiTags('Master Data')
@Controller('master-data/attire-destination-groups')
export class AttireDestinationGroupsController {
  constructor(private readonly attireDestinationGroupsService: AttireDestinationGroupsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new attire destination group' })
  @ApiResponse({ 
    status: 201, 
    description: 'Attire destination group created successfully',
    type: AttireDestinationGroups 
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  create(@Body() createAttireDestinationGroupsDto: CreateAttireDestinationGroupsDto): Promise<AttireDestinationGroups> {
    return this.attireDestinationGroupsService.create(createAttireDestinationGroupsDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all attire destination groups with pagination and filters' })
  @ApiResponse({ 
    status: 200, 
    description: 'Return all attire destination groups with countries',
    type: [AttireDestinationGroups] 
  })
  @ApiQuery({ name: 'page', type: Number, required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', type: Number, required: false, description: 'Number of items per page' })
  @ApiQuery({ name: 'orderBy', type: String, required: false, description: 'Field to order by' })
  @ApiQuery({ name: 'orderDir', type: String, required: false, description: 'Order direction' })
  @ApiQuery({ name: 'assignmentType', type: String, required: false, description: 'Assignment type filter' })
  @ApiQuery({ name: 'groupCode', type: String, required: false, description: 'Group code filter' })
  @ApiQuery({ name: 'searchTerm', type: String, required: false, description: 'Search term' })
  findAll(
    @Query('page', new ValidationPipe({ transform: true })) page?: number,
    @Query('limit', new ValidationPipe({ transform: true })) limit?: number,
    @Query('orderBy') orderBy?: AttireDestinationGroupsQueryDto['orderBy'],
    @Query('orderDir') orderDir?: 'asc' | 'desc',
    @Query('assignmentType') assignmentType?: 'TEMPORARY' | 'PERMANENT',
    @Query('groupCode') groupCode?: string,
    @Query('searchTerm') searchTerm?: string,
  ): Promise<PaginatedResult<AttireDestinationGroups>> {
    const queryOptions: AttireDestinationGroupsQueryDto = {
      page,
      limit,
      orderBy,
      orderDir,
      assignmentType,
      groupCode,
      searchTerm,
    };

    return this.attireDestinationGroupsService.findAll(queryOptions);
  }

  @Get('all-with-countries')
  @ApiOperation({ summary: 'Get all attire destination groups with their countries (no pagination)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Return all attire destination groups with countries',
    type: [AttireDestinationGroups] 
  })
  findAllWithCountries(): Promise<AttireDestinationGroups[]> {
    return this.attireDestinationGroupsService.findAllWithCountries();
  }

  @Get('assignment-type/:type')
  @ApiOperation({ summary: 'Get attire destination groups by assignment type' })
  @ApiParam({ 
    name: 'type', 
    enum: ['TEMPORARY', 'PERMANENT'],
    description: 'Assignment type' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Return attire destination groups by assignment type',
    type: [AttireDestinationGroups] 
  })
  @ApiBadRequestResponse({ description: 'Invalid assignment type' })
  findByAssignmentType(@Param('type') type: string): Promise<AttireDestinationGroups[]> {
    return this.attireDestinationGroupsService.findByAssignmentType(type);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get attire destination group by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Group ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Return attire destination group with countries',
    type: AttireDestinationGroups 
  })
  @ApiNotFoundResponse({ description: 'Attire destination group not found' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<AttireDestinationGroups> {
    return this.attireDestinationGroupsService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update attire destination group' })
  @ApiParam({ name: 'id', type: Number, description: 'Group ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Attire destination group updated successfully',
    type: AttireDestinationGroups 
  })
  @ApiNotFoundResponse({ description: 'Attire destination group not found' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAttireDestinationGroupsDto: UpdateAttireDestinationGroupsDto,
  ): Promise<AttireDestinationGroups> {
    return this.attireDestinationGroupsService.update(id, updateAttireDestinationGroupsDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete attire destination group' })
  @ApiParam({ name: 'id', type: Number, description: 'Group ID' })
  @ApiResponse({ status: 200, description: 'Attire destination group deleted successfully' })
  @ApiNotFoundResponse({ description: 'Attire destination group not found' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.attireDestinationGroupsService.remove(id);
  }

  @Post(':id/countries')
  @ApiOperation({ summary: 'Add countries to attire destination group' })
  @ApiParam({ name: 'id', type: Number, description: 'Group ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Countries added to group successfully',
    type: AttireDestinationGroups 
  })
  @ApiNotFoundResponse({ description: 'Attire destination group not found' })
  @ApiBadRequestResponse({ description: 'Invalid country IDs' })
  addCountries(
    @Param('id', ParseIntPipe) id: number,
    @Body('countryIds', new ParseArrayPipe({ items: Number, separator: ',' })) countryIds: number[],
  ): Promise<AttireDestinationGroups> {
    return this.attireDestinationGroupsService.addCountriesToGroup(id, countryIds);
  }

  @Delete(':id/countries')
  @ApiOperation({ summary: 'Remove countries from attire destination group' })
  @ApiParam({ name: 'id', type: Number, description: 'Group ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Countries removed from group successfully',
    type: AttireDestinationGroups 
  })
  @ApiNotFoundResponse({ description: 'Attire destination group not found' })
  @ApiBadRequestResponse({ description: 'Invalid country IDs' })
  removeCountries(
    @Param('id', ParseIntPipe) id: number,
    @Body('countryIds', new ParseArrayPipe({ items: Number, separator: ',' })) countryIds: number[],
  ): Promise<AttireDestinationGroups> {
    return this.attireDestinationGroupsService.removeCountriesFromGroup(id, countryIds);
  }
} 