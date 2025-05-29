import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsDate, IsEnum, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class ProvincesQueryDto {
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

  @ApiProperty({ required: false, enum: ['ASC', 'DESC'] })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  orderDir?: 'ASC' | 'DESC';

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  nameEn?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  nameTh?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isPerimeter?: boolean;

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