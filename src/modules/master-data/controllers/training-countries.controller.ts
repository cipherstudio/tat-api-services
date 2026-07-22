import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { CreateTrainingCountryDto } from '../dto/create-training-countries.dto';
import { UpdateTrainingCountryDto } from '../dto/update-training-countries.dto';
import { TrainingCountriesService } from '../services/training-countries.service';

@ApiTags('Master Data')
@Controller('master-data/training-countries')
@UseGuards(JwtAuthGuard)
export class TrainingCountriesController {
  constructor(private readonly service: TrainingCountriesService) {}
  @UseGuards(AdminGuard) @Post() create(@Body() dto: CreateTrainingCountryDto) { return this.service.create(dto); }
  @Get() findAll(@Query('page') page?: number, @Query('limit') limit?: number, @Query('orderBy') orderBy?: string, @Query('orderDir') orderDir?: 'ASC' | 'DESC', @Query('searchTerm') searchTerm?: string) { return this.service.findAll({ page: page ? Number(page) : undefined, limit: limit ? Number(limit) : undefined, orderBy, orderDir, searchTerm }); }
  @Get(':id') findById(@Param('id', ParseIntPipe) id: number) { return this.service.findById(id); }
  @UseGuards(AdminGuard) @Patch(':id') update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTrainingCountryDto) { return this.service.update(id, dto); }
  @UseGuards(AdminGuard) @Delete(':id') @HttpCode(HttpStatus.NO_CONTENT) remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}
