import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsNumber, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class PerDiemRatesQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  orderBy?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  orderDir?: 'ASC' | 'DESC';

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  positionGroup?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  positionName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  levelCodeStart?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  levelCodeEnd?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(['IN', 'OUT', 'ABROAD'])
  areaType?: 'IN' | 'OUT' | 'ABROAD';

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  searchTerm?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  createdAfter?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  createdBefore?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  updatedAfter?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  updatedBefore?: Date;
} 