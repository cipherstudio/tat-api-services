import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { IsOptional, IsNumber } from 'class-validator';

export class QueryEmployeeDto {
  @ApiPropertyOptional({ description: 'รหัสพนักงาน' })
  @IsOptional()
  code?: string;
  @ApiPropertyOptional({ description: 'ชื่อพนักงาน' })
  @IsOptional()
  name?: string;
  @ApiPropertyOptional({ description: 'ค้นหาจากชื่อพนักงาน (LIKE query)' })
  @IsOptional()
  searchTerm?: string;
  @ApiPropertyOptional({ description: 'เพศ' })
  @IsOptional()
  sex?: string;
  @ApiPropertyOptional({ description: 'จังหวัด' })
  @IsOptional()
  province?: string;
  @ApiPropertyOptional({ description: 'แผนก' })
  @IsOptional()
  department?: string;
  @ApiPropertyOptional({ description: 'ตำแหน่ง' })
  @IsOptional()
  position?: string;
  @ApiPropertyOptional({ description: 'ช่วงเงินเดือนขั้นต่ำ' })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @Type(() => Number)
  @IsNumber()
  minSalary?: number;
  @ApiPropertyOptional({ description: 'ช่วงเงินเดือนสูงสุด' })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @Type(() => Number)
  @IsNumber()
  maxSalary?: number;
  @ApiPropertyOptional({
    description: 'จำนวนรายการต่อหน้า (pagination)',
    type: Number,
    default: 10,
  })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @Type(() => Number)
  @IsNumber()
  limit: number = 10;
  @ApiPropertyOptional({
    description: 'ข้ามกี่รายการ (pagination offset)',
    type: Number,
    default: 0,
  })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @Type(() => Number)
  @IsNumber()
  offset: number = 0;
  @ApiPropertyOptional({ description: 'หน้าที่ต้องการ (page)', default: 1 })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @Type(() => Number)
  @IsNumber()
  page?: number;
  // เพิ่ม field อื่น ๆ ตามต้องการ
}
