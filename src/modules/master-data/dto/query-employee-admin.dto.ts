import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { CommonQueryDto } from '../../../common/dto/common-query.dtp';

export class QueryEmployeeAdminDto extends CommonQueryDto {
  @IsOptional()
  @IsString()
  pmt_code?: string;

  @IsOptional()
  @IsString()
  employee_code?: string;

  @IsOptional()
  @IsString()
  employee_name?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  division?: string;

  @IsOptional()
  @IsString()
  section?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsBoolean()
  is_suspended?: boolean;

  @IsOptional()
  @IsString()
  searchTerm?: string;
}
