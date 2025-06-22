import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, IsNumber, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class QueryOrganizationStructureDto {
  @ApiPropertyOptional({
    description: 'รหัสหน่วยงานหลัก (เช่น 100000, 200000)',
  })
  @IsOptional()
  @IsString()
  mainOrganizationCode?: string;

  @ApiPropertyOptional({
    description: 'รหัสฝ่าย/กลุ่มงาน (เช่น 110000, 120000)',
  })
  @IsOptional()
  @IsString()
  departmentCode?: string;

  @ApiPropertyOptional({
    description: 'รหัสกอง (เช่น 110100, 110200)',
  })
  @IsOptional()
  @IsString()
  divisionCode?: string;

  @ApiPropertyOptional({
    description: 'รหัสงาน (เช่น 110101, 110102)',
  })
  @IsOptional()
  @IsString()
  sectionCode?: string;

  @ApiPropertyOptional({
    description: 'ค้นหาจากชื่อหน่วยงาน',
  })
  @IsOptional()
  @IsString()
  searchTerm?: string;

  @ApiPropertyOptional({
    description: 'รวมข้อมูลพนักงานด้วยหรือไม่',
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  includeEmployees?: boolean = true;

  @ApiPropertyOptional({
    description: 'แสดงเฉพาะหน่วยงานที่มีพนักงาน',
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  onlyWithEmployees?: boolean = false;

  // Employee filtering parameters
  @ApiPropertyOptional({
    description: 'ค้นหาพนักงานจากชื่อ-นามสกุลหรือตำแหน่งงาน',
  })
  @IsOptional()
  @IsString()
  employeeSearchTerm?: string;

  @ApiPropertyOptional({
    description: 'หน้าของข้อมูลพนักงานทั้งหมดในหน่วยงานหลัก',
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  employeePage?: number = 1;

  @ApiPropertyOptional({
    description: 'จำนวนพนักงานต่อหน้าในหน่วยงานหลัก',
    minimum: 1,
    default: 10,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  employeeLimit?: number = 10;
} 