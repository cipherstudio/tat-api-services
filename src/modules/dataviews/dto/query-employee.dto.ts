import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { IsOptional, IsNumber } from 'class-validator';
import { CommonQueryDto } from '../../../common/dto/common-query.dtp';

export class QueryEmployeeDto extends CommonQueryDto {
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
}
