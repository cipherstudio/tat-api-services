import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString, IsNumber, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';

export class CommuteQueryDto {
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

  @ApiPropertyOptional({ description: 'รหัสหนังสือขออนุมัติเดินทาง' })
  @IsOptional()
  @IsString()
  incrementId?: string;

  @ApiPropertyOptional({ 
    description: 'สถานะการอนุมัติ (DRAFT, PENDING, APPROVED, REJECTED)',
    example: 'DRAFT'
  })
  @IsOptional()
  @IsString()
  approvalStatus?: string;

  @ApiPropertyOptional({ description: 'เรื่องขออนุมัติเดินทาง' })
  @IsOptional()
  @IsString()
  documentTitle?: string;

  @ApiPropertyOptional({ description: 'ผู้ขออนุมัติ' })
  @IsOptional()
  @IsString()
  requesterName?: string;

  @ApiPropertyOptional({ description: 'วันที่เดินทางตั้งแต่' })
  @IsOptional()
  @IsDateString()
  approvalDateStart?: string;

  @ApiPropertyOptional({ description: 'วันที่เดินทางถึง' })
  @IsOptional()
  @IsDateString()
  approvalDateEnd?: string;

  @ApiPropertyOptional({ description: 'ประเภทการเดินทาง' })
  @IsOptional()
  @IsString()
  travelType?: string;
} 