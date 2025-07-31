import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString, IsNumber, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';

export class WorkQueryDto {
  @ApiPropertyOptional({ description: 'Page number' })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  page?: number;

  @ApiPropertyOptional({ description: 'Number of items per page' })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  limit?: number;

  @ApiPropertyOptional({ description: 'Field to order by' })
  @IsOptional()
  @IsString()
  orderBy?: string;

  @ApiPropertyOptional({ description: 'Order direction', enum: ['ASC', 'DESC'] })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  orderDir?: 'ASC' | 'DESC';

  @ApiPropertyOptional({ description: 'วันที่เริ่มต้น' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'วันที่สิ้นสุด' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'รหัสผู้ใช้' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ description: 'ชื่อเอกสาร' })
  @IsOptional()
  @IsString()
  documentTitle?: string;

  @ApiPropertyOptional({ description: 'สถานะการอนุมัติ' })
  @IsOptional()
  @IsString()
  approvalStatus?: string;

  @ApiPropertyOptional({ description: 'ระดับความเร่งด่วน' })
  @IsOptional()
  @IsString()
  urgencyLevel?: string;
} 