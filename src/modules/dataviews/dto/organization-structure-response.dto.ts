import { ApiProperty } from '@nestjs/swagger';

export class EmployeeDto {
  @ApiProperty({ description: 'รหัสพนักงาน' })
  pmtCode: string;

  @ApiProperty({ description: 'ชื่อ-นามสกุล (ไทย)' })
  pmtNameT: string;

  @ApiProperty({ description: 'ชื่อ-นามสกุล (อังกฤษ)' })
  pmtNameE: string;

  @ApiProperty({ description: 'รหัสตำแหน่ง' })
  pmtPosNo: string;

  @ApiProperty({ description: 'รหัสระดับ' })
  pmtLevelCode: string;

  @ApiProperty({ description: 'ชื่อตำแหน่ง' })
  positionName: string;
}

export class SectionDto {
  @ApiProperty({ description: 'รหัสงาน' })
  code: string;

  @ApiProperty({ description: 'ชื่องาน' })
  name: string;

  @ApiProperty({ description: 'ชื่อย่อ' })
  abbreviation: string;

  @ApiProperty({ description: 'ชื่อย่อตำแหน่ง' })
  positionAbbreviation: string;

  @ApiProperty({ description: 'พนักงานในงาน', type: [EmployeeDto] })
  employees: EmployeeDto[];
}

export class DivisionDto {
  @ApiProperty({ description: 'รหัสกอง' })
  code: string;

  @ApiProperty({ description: 'ชื่อกอง' })
  name: string;

  @ApiProperty({ description: 'ชื่อย่อ' })
  abbreviation: string;

  @ApiProperty({ description: 'ชื่อย่อตำแหน่ง' })
  positionAbbreviation: string;

  @ApiProperty({ description: 'งานในกองนี้', type: [SectionDto] })
  sections: SectionDto[];

  @ApiProperty({ description: 'พนักงานในกอง', type: [EmployeeDto] })
  employees: EmployeeDto[];
}

export class DepartmentDto {
  @ApiProperty({ description: 'รหัสฝ่าย/กลุ่ม' })
  code: string;

  @ApiProperty({ description: 'ชื่อฝ่าย/กลุ่ม' })
  name: string;

  @ApiProperty({ description: 'ชื่อย่อ' })
  abbreviation: string;

  @ApiProperty({ description: 'ชื่อย่อตำแหน่ง' })
  positionAbbreviation: string;

  @ApiProperty({ description: 'กองในฝ่าย/กลุ่มนี้', type: [DivisionDto] })
  divisions: DivisionDto[];

  @ApiProperty({ description: 'พนักงานในฝ่าย/กลุ่ม', type: [EmployeeDto] })
  employees: EmployeeDto[];
}

export class MainOrganizationDto {
  @ApiProperty({ description: 'รหัสหน่วยงานหลัก' })
  code: string;

  @ApiProperty({ description: 'ชื่อหน่วยงานหลัก' })
  name: string;

  @ApiProperty({ description: 'ชื่อย่อ' })
  abbreviation: string;

  @ApiProperty({ description: 'ชื่อย่อตำแหน่ง' })
  positionAbbreviation: string;

  @ApiProperty({ description: 'ฝ่าย/กลุ่มในหน่วยงาน', type: [DepartmentDto] })
  departments: DepartmentDto[];

  @ApiProperty({ description: 'พนักงานของหน่วยงานหลัก', type: [EmployeeDto] })
  employees: EmployeeDto[];
}

export class OrganizationStructureDto {
  @ApiProperty({ description: 'หน่วยงานหลักทั้งหมด', type: [MainOrganizationDto] })
  mainOrganizations: MainOrganizationDto[];

  @ApiProperty({ description: 'จำนวนพนักงานทั้งหมด' })
  totalEmployees: number;

  @ApiProperty({ description: 'จำนวนฝ่าย/กลุ่มทั้งหมด' })
  totalDepartments: number;

  @ApiProperty({ description: 'จำนวนกองทั้งหมด' })
  totalDivisions: number;

  @ApiProperty({ description: 'จำนวนงานทั้งหมด' })
  totalSections: number;
}

export class OrganizationStructureResponseDto {
  @ApiProperty({ description: 'ข้อมูลโครงสร้างองค์กร', type: OrganizationStructureDto })
  data: OrganizationStructureDto;

  @ApiProperty({
    description: 'ข้อมูลเพิ่มเติม',
    type: 'object',
    properties: {
      total: { type: 'number', description: 'จำนวนรายการทั้งหมด' },
      timestamp: { type: 'string', format: 'date-time', description: 'เวลาที่ดึงข้อมูล' },
    },
  })
  meta: {
    total: number;
    timestamp: string;
  };
} 