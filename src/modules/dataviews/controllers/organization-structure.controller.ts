import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
  ValidationPipe,
  Delete,
  HttpCode,
  HttpStatus,
  Version,
} from '@nestjs/common';
import { OrganizationStructureService } from '../services/organization-structure.service';
import { QueryOrganizationStructureDto } from '../dto/query-organization-structure.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { OrganizationStructurePaginate } from '../entities/organization-structure.entity';
import { OrganizationStructureResponseDto } from '../dto/organization-structure-response.dto';

@ApiTags('Organization Structure')
@Controller('organization-structure')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class OrganizationStructureController {
  constructor(
    private readonly organizationStructureService: OrganizationStructureService,
  ) {}

  @Version('1')
  @Get()
  @ApiOperation({
    summary: 'ดึงโครงสร้างองค์กร ททท. แบบลำดับชั้น',
    description: `
      API สำหรับดึงโครงสร้างองค์กร ททท. แบบ nested object ตามลำดับชั้น:
      - หน่วยงานหลัก (X00000)
      - ฝ่าย/กลุ่มงาน (XX0000) 
      - กอง (XXX000)
      - งาน (XXXXXX)
      รวมถึงข้อมูลพนักงานในแต่ละหน่วยงาน
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'โครงสร้างองค์กรพร้อมข้อมูลพนักงาน',
    type: OrganizationStructureResponseDto,
  })
  @ApiQuery({
    name: 'mainOrganizationCode',
    required: false,
    description: 'รหัสหน่วยงานหลัก (เช่น 100000)',
  })
  @ApiQuery({
    name: 'departmentCode',
    required: false,
    description: 'รหัสฝ่าย/กลุ่มงาน (เช่น 110000)',
  })
  @ApiQuery({
    name: 'divisionCode',
    required: false,
    description: 'รหัสกอง (เช่น 110100)',
  })
  @ApiQuery({
    name: 'sectionCode',
    required: false,
    description: 'รหัสงาน (เช่น 110101)',
  })
  @ApiQuery({
    name: 'searchTerm',
    required: false,
    description: 'ค้นหาจากชื่อหน่วยงาน',
  })
  @ApiQuery({
    name: 'includeEmployees',
    required: false,
    description: 'รวมข้อมูลพนักงานด้วยหรือไม่',
  })
  @ApiQuery({
    name: 'onlyWithEmployees',
    required: false,
    description: 'แสดงเฉพาะหน่วยงานที่มีพนักงาน',
  })
  async getOrganizationStructure(
    @Query(new ValidationPipe({ transform: true }))
    query: QueryOrganizationStructureDto,
  ): Promise<OrganizationStructurePaginate> {
    return this.organizationStructureService.getOrganizationStructure(query);
  }

  @Version('1')
  @Get('by-code/:code')
  @ApiOperation({
    summary: 'ดึงโครงสร้างองค์กรตามรหัสหน่วยงาน',
    description: `
      ดึงโครงสร้างองค์กรเฉพาะหน่วยงานที่ระบุ รวมถึงหน่วยงานย่อยและพนักงาน
      รองรับรหัสทุกระดับ (100000, 110000, 110100, 110101)
    `,
  })
  @ApiParam({
    name: 'code',
    description: 'รหัสหน่วยงาน (6 หลัก)',
    example: '110000',
  })
  @ApiResponse({
    status: 200,
    description: 'โครงสร้างองค์กรของหน่วยงานที่ระบุ',
    type: OrganizationStructureResponseDto,
  })
  async getOrganizationByCode(@Param('code') code: string): Promise<OrganizationStructurePaginate> {
    return this.organizationStructureService.getOrganizationByCode(code);
  }

  @Version('1')
  @Get('search')
  @ApiOperation({
    summary: 'ค้นหาหน่วยงานจากชื่อ',
    description: 'ค้นหาหน่วยงานจากชื่อภาษาไทยหรือภาษาอังกฤษ',
  })
  @ApiQuery({
    name: 'q',
    description: 'คำค้นหา',
    example: 'สำนักผู้ว่าการ',
  })
  @ApiResponse({
    status: 200,
    description: 'ผลการค้นหาหน่วยงาน',
    type: OrganizationStructureResponseDto,
  })
  async searchOrganizations(
    @Query('q') searchTerm: string,
  ): Promise<OrganizationStructurePaginate> {
    return this.organizationStructureService.searchOrganizations(searchTerm);
  }

  @Version('1')
  @Get('with-employees')
  @ApiOperation({
    summary: 'ดึงเฉพาะหน่วยงานที่มีพนักงาน',
    description: 'ดึงโครงสร้างองค์กรเฉพาะหน่วยงานที่มีพนักงานทำงานอยู่',
  })
  @ApiResponse({
    status: 200,
    description: 'โครงสร้างองค์กรที่มีพนักงาน',
    type: OrganizationStructureResponseDto,
  })
  async getOrganizationsWithEmployees(): Promise<OrganizationStructurePaginate> {
    return this.organizationStructureService.getOrganizationsWithEmployees();
  }

  @Version('1')
  @Get('statistics')
  @ApiOperation({
    summary: 'ดึงสถิติโครงสร้างองค์กร',
    description: 'ดึงสถิติจำนวนหน่วยงานและพนักงานทั้งหมด',
  })
  @ApiResponse({
    status: 200,
    description: 'สถิติโครงสร้างองค์กร',
    schema: {
      type: 'object',
      properties: {
        totalMainOrganizations: { type: 'number', description: 'จำนวนหน่วยงานหลัก' },
        totalDepartments: { type: 'number', description: 'จำนวนฝ่าย/กลุ่มงาน' },
        totalDivisions: { type: 'number', description: 'จำนวนกอง' },
        totalSections: { type: 'number', description: 'จำนวนงาน' },
        totalEmployees: { type: 'number', description: 'จำนวนพนักงานทั้งหมด' },
      },
    },
  })
  async getStatistics(): Promise<{
    totalMainOrganizations: number;
    totalDepartments: number;
    totalDivisions: number;
    totalSections: number;
    totalEmployees: number;
  }> {
    return this.organizationStructureService.getStatistics();
  }

  @Version('1')
  @Delete('cache')
  @ApiOperation({
    summary: 'ลบ cache โครงสร้างองค์กร',
    description: 'ลบ cache ทั้งหมดที่เกี่ยวข้องกับโครงสร้างองค์กร (ใช้เมื่อมีการอัปเดตข้อมูล)',
  })
  @ApiResponse({
    status: 204,
    description: 'ลบ cache สำเร็จ',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async clearCache(): Promise<void> {
    return this.organizationStructureService.clearCache();
  }
} 