import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { EmployeeAdminService } from '../services/employee-admin.service';
import { CreateEmployeeAdminDto } from '../dto/create-employee-admin.dto';
import { UpdateEmployeeAdminDto } from '../dto/update-employee-admin.dto';
import { QueryEmployeeAdminDto } from '../dto/query-employee-admin.dto';
import { EmployeeAdmin } from '../entities/employee-admin.entity';
import { PaginatedResult } from '../../../common/interfaces/pagination.interface';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('Employee Admin')
@Controller('employee-admin')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class EmployeeAdminController {
  constructor(private readonly employeeAdminService: EmployeeAdminService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new employee admin' })
  @ApiResponse({
    status: 201,
    description: 'Employee admin created successfully',
  })
  @ApiResponse({
    status: 409,
    description: 'PMT_CODE or Employee Code already exists',
  })
  async create(
    @Body() createDto: CreateEmployeeAdminDto,
  ): Promise<EmployeeAdmin> {
    return await this.employeeAdminService.create(createDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all employee admins with pagination and filters',
  })
  @ApiResponse({
    status: 200,
    description: 'Employee admins retrieved successfully',
  })
  async findAll(
    @Query() query: QueryEmployeeAdminDto,
  ): Promise<PaginatedResult<EmployeeAdmin>> {
    return await this.employeeAdminService.findAll(query);
  }

  @Get('active-employees')
  @ApiOperation({ summary: 'Get all active employees' })
  @ApiResponse({
    status: 200,
    description: 'Active employees retrieved successfully',
  })
  async findActiveEmployees(): Promise<EmployeeAdmin[]> {
    return await this.employeeAdminService.findActiveEmployees();
  }

  @Get('active-non-suspended-employees')
  @ApiOperation({ summary: 'Get all active and non-suspended employees' })
  @ApiResponse({
    status: 200,
    description: 'Active employees retrieved successfully',
  })
  async findActiveNonSuspendedEmployees(): Promise<EmployeeAdmin[]> {
    return await this.employeeAdminService.findActiveNonSuspendedEmployees();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get employee admin by ID' })
  @ApiResponse({
    status: 200,
    description: 'Employee admin retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Employee admin not found' })
  async findOne(@Param('id') id: string): Promise<EmployeeAdmin> {
    return await this.employeeAdminService.findOne(+id);
  }

  @Get('pmt-code/:pmtCode')
  @ApiOperation({ summary: 'Get employee admin by PMT_CODE' })
  @ApiResponse({
    status: 200,
    description: 'Employee admin retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Employee admin not found' })
  async findByPmtCode(
    @Param('pmtCode') pmtCode: string,
  ): Promise<EmployeeAdmin> {
    return await this.employeeAdminService.findByPmtCode(pmtCode);
  }

  @Get('employee-code/:employeeCode')
  @ApiOperation({ summary: 'Get employee admin by Employee Code' })
  @ApiResponse({
    status: 200,
    description: 'Employee admin retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Employee admin not found' })
  async findByEmployeeCode(
    @Param('employeeCode') employeeCode: string,
  ): Promise<EmployeeAdmin> {
    return await this.employeeAdminService.findByEmployeeCode(employeeCode);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update employee admin' })
  @ApiResponse({
    status: 200,
    description: 'Employee admin updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Employee admin not found' })
  @ApiResponse({
    status: 409,
    description: 'PMT_CODE or Employee Code already exists',
  })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateEmployeeAdminDto,
  ): Promise<EmployeeAdmin> {
    return await this.employeeAdminService.update(+id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete employee admin (soft delete)' })
  @ApiResponse({
    status: 204,
    description: 'Employee admin deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Employee admin not found' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.employeeAdminService.remove(+id);
  }

  @Post(':id/suspend')
  @ApiOperation({ summary: 'Suspend an employee' })
  @ApiResponse({ status: 200, description: 'Employee suspended successfully' })
  @ApiResponse({ status: 404, description: 'Employee admin not found' })
  async suspendEmployee(
    @Param('id') id: string,
    @Body() body: { suspended_until: string; updated_by: string },
  ): Promise<void> {
    await this.employeeAdminService.suspendEmployee(
      +id,
      new Date(body.suspended_until),
      body.updated_by,
    );
  }

  @Post(':id/activate')
  @ApiOperation({ summary: 'Activate a suspended employee' })
  @ApiResponse({ status: 200, description: 'Employee activated successfully' })
  @ApiResponse({ status: 404, description: 'Employee admin not found' })
  async activateEmployee(
    @Param('id') id: string,
    @Body() body: { updated_by: string },
  ): Promise<void> {
    await this.employeeAdminService.activateEmployee(+id, body.updated_by);
  }
}
