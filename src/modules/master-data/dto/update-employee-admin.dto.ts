import { PartialType } from '@nestjs/mapped-types';
import { CreateEmployeeAdminDto } from './create-employee-admin.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateEmployeeAdminDto extends PartialType(CreateEmployeeAdminDto) {
  @IsOptional()
  @IsString()
  updated_by?: string;
} 