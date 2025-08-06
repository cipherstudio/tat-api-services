import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsNumber, IsDateString } from 'class-validator';
import { AuditLogStatus, AuditLogCategory } from '../entities/audit-log.entity';

export class CreateAuditLogDto {
  @ApiProperty({ description: 'Employee code', example: '38019' })
  @IsOptional()
  @IsString()
  employeeCode?: string;

  @ApiProperty({ description: 'Employee name', example: 'John Doe' })
  @IsOptional()
  @IsString()
  employeeName?: string;

  @ApiProperty({ description: 'Action performed', example: 'LOGIN' })
  @IsString()
  action: string;

  @ApiProperty({ description: 'Additional details', required: false })
  @IsOptional()
  details?: any;

  @ApiProperty({ description: 'IP address', example: '192.168.1.1' })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiProperty({ description: 'User agent', example: 'Mozilla/5.0...' })
  @IsOptional()
  @IsString()
  userAgent?: string;

  @ApiProperty({ description: 'Status of the action', enum: AuditLogStatus })
  @IsOptional()
  @IsEnum(AuditLogStatus)
  status?: AuditLogStatus;

  @ApiProperty({ description: 'Category of the action', enum: AuditLogCategory })
  @IsOptional()
  @IsEnum(AuditLogCategory)
  category?: AuditLogCategory;
}

export class GetAuditLogsDto {
  @ApiProperty({ description: 'Employee code to filter by', example: '38019' })
  @IsOptional()
  @IsString()
  employeeCode?: string;

  @ApiProperty({ description: 'Page number', example: 1 })
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiProperty({ description: 'Number of items per page', example: 10 })
  @IsOptional()
  @IsNumber()
  limit?: number;

  @ApiProperty({ description: 'Status filter', enum: AuditLogStatus })
  @IsOptional()
  @IsEnum(AuditLogStatus)
  status?: AuditLogStatus;

  @ApiProperty({ description: 'Category filter', enum: AuditLogCategory })
  @IsOptional()
  @IsEnum(AuditLogCategory)
  category?: AuditLogCategory;
}

export class AuditLogResponseDto {
  @ApiProperty({ description: 'Audit log ID' })
  id: number;

  @ApiProperty({ description: 'Employee code', example: '38019' })
  employeeCode?: string;

  @ApiProperty({ description: 'Employee name', example: 'John Doe' })
  employeeName?: string;

  @ApiProperty({ description: 'Action performed', example: 'LOGIN' })
  action: string;

  @ApiProperty({ description: 'Additional details' })
  details?: any;

  @ApiProperty({ description: 'IP address', example: '192.168.1.1' })
  ipAddress?: string;

  @ApiProperty({ description: 'User agent' })
  userAgent?: string;

  @ApiProperty({ description: 'Status of the action', enum: AuditLogStatus })
  status: AuditLogStatus;

  @ApiProperty({ description: 'Category of the action', enum: AuditLogCategory })
  category: AuditLogCategory;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;
} 