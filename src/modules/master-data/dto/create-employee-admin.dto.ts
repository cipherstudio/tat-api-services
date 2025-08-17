import { IsString, IsOptional, IsBoolean, IsDateString } from 'class-validator';

export class CreateEmployeeAdminDto {
  @IsString()
  pmt_code: string;

  @IsString()
  employee_code: string;

  @IsString()
  employee_name: string;

  @IsOptional()
  @IsString()
  position?: string;

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
  @IsDateString()
  suspended_until?: Date;

  @IsOptional()
  @IsString()
  created_by?: string;
}
