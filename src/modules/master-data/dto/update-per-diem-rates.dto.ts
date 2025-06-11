import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsNumber, IsBoolean, IsOptional } from 'class-validator';

export class UpdatePerDiemRatesDto {
  @ApiProperty({ description: 'Position group', required: false })
  @IsString()
  @IsOptional()
  positionGroup?: string;

  @ApiProperty({ description: 'Position name', required: false })
  @IsString()
  @IsOptional()
  positionName?: string;

  @ApiProperty({ description: 'Level code start', required: false })
  @IsString()
  @IsOptional()
  levelCodeStart?: string;

  @ApiProperty({ description: 'Level code end', required: false })
  @IsString()
  @IsOptional()
  levelCodeEnd?: string;

  @ApiProperty({ description: 'Area type (IN / OUT / ABROAD)', required: false })
  @IsEnum(['IN', 'OUT', 'ABROAD'])
  @IsOptional()
  areaType?: 'IN' | 'OUT' | 'ABROAD';

  @ApiProperty({ description: 'Per diem standard rate', required: false })
  @IsNumber()
  @IsOptional()
  perDiemStandard?: number;

  @ApiProperty({ description: 'Is per diem editable', required: false })
  @IsBoolean()
  @IsOptional()
  isEditablePerDiem?: boolean;

  @ApiProperty({ description: 'Maximum per diem rate', required: false })
  @IsNumber()
  @IsOptional()
  maxPerDiem?: number;
} 