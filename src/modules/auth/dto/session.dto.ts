import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsDateString } from 'class-validator';

export class CreateSessionDto {
  @ApiProperty({ description: 'Employee code', example: '38019' })
  @IsString()
  employeeCode: string;

  @ApiProperty({ description: 'Employee name', example: 'John Doe' })
  @IsString()
  employeeName: string;

  @ApiProperty({ description: 'Session token' })
  @IsString()
  token: string;

  @ApiProperty({ description: 'Device information', required: false })
  @IsOptional()
  @IsString()
  deviceInfo?: string;

  @ApiProperty({ description: 'IP address', example: '192.168.1.1' })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiProperty({ description: 'Session expiration time' })
  @IsDateString()
  expiresAt: Date;
}

export class GetSessionsDto {
  @ApiProperty({ description: 'Employee code to filter by', example: '38019' })
  @IsOptional()
  @IsString()
  employeeCode?: string;

  @ApiProperty({ description: 'Employee name to filter by', example: 'John Doe' })
  @IsOptional()
  @IsString()
  employeeName?: string;

  @ApiProperty({ description: 'Filter by active status', example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: 'Page number', example: 1 })
  @IsOptional()
  page?: number;

  @ApiProperty({ description: 'Number of items per page', example: 10 })
  @IsOptional()
  limit?: number;
}

export class SessionResponseDto {
  @ApiProperty({ description: 'Session ID' })
  id: number;

  @ApiProperty({ description: 'Employee code', example: '38019' })
  employeeCode?: string;

  @ApiProperty({ description: 'Employee name', example: 'John Doe' })
  employeeName?: string;

  @ApiProperty({ description: 'Session token' })
  token: string;

  @ApiProperty({ description: 'Device information' })
  deviceInfo?: string;

  @ApiProperty({ description: 'IP address', example: '192.168.1.1' })
  ipAddress?: string;

  @ApiProperty({ description: 'Whether session is active' })
  isActive: boolean;

  @ApiProperty({ description: 'Session expiration time' })
  expiresAt: Date;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

export class DeactivateSessionDto {
  @ApiProperty({ description: 'Employee code to deactivate sessions for', example: '38019' })
  @IsOptional()
  @IsString()
  employeeCode?: string;

  @ApiProperty({ description: 'Employee name to deactivate sessions for', example: 'John Doe' })
  @IsOptional()
  @IsString()
  employeeName?: string;
} 