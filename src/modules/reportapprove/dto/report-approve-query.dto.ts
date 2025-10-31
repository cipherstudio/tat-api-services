import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  IsDate,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class ReportApproveQueryDto {
  @ApiPropertyOptional({ description: 'Title of the report' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Name of the creator' })
  @IsOptional()
  @IsString()
  creatorName?: string;

  @ApiPropertyOptional({ description: 'Code of the creator' })
  @IsOptional()
  @IsString()
  creatorCode?: string;

  @ApiPropertyOptional({ description: 'Document number' })
  @IsOptional()
  @IsString()
  documentNumber?: string;

  @ApiPropertyOptional({ description: 'Status of the report', type: Number })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value ? Number(value) : undefined))
  status?: number;

  @ApiPropertyOptional({ description: 'Page number', default: 1, type: Number })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value ? Number(value) : undefined))
  page?: number;

  @ApiPropertyOptional({
    description: 'Items per page',
    default: 10,
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value ? Number(value) : undefined))
  limit?: number;

  @ApiPropertyOptional({
    description: 'Field to order by',
    default: 'created_at',
    example: 'created_at',
  })
  @IsOptional()
  @IsString()
  orderBy?: string;

  @ApiPropertyOptional({
    description: 'Order direction',
    enum: ['ASC', 'DESC'],
    default: 'DESC',
  })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  orderDir?: 'ASC' | 'DESC';

  @ApiPropertyOptional({
    description: 'Approve id',
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value ? Number(value) : undefined))
  approveId?: number;

  @ApiPropertyOptional({
    description: 'Deleted at',
    type: Date,
  })
  @IsOptional()
  @IsDate()
  deletedAt?: Date;

  @ApiPropertyOptional({
    example: '2024-01-01',
    description: 'วันที่ทำเรื่องเริ่มต้น (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => {
    if (!value) return value;
    // Ensure date is in YYYY-MM-DD format
    const date = new Date(value);
    if (isNaN(date.getTime())) return value;
    return date.toISOString().split('T')[0];
  })
  startDate?: string;

  @ApiPropertyOptional({
    example: '2024-12-31',
    description: 'วันที่ทำเรื่องสิ้นสุด (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => {
    if (!value) return value;
    // Ensure date is in YYYY-MM-DD format
    const date = new Date(value);
    if (isNaN(date.getTime())) return value;
    return date.toISOString().split('T')[0];
  })
  endDate?: string;
}
