import { IsOptional, IsString, IsNumber, IsDate, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class CountriesQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsEnum(['nameEn', 'nameTh', 'code', 'id', 'createdAt', 'updatedAt'])
  orderBy?: 'nameEn' | 'nameTh' | 'code' | 'id' | 'createdAt' | 'updatedAt';

  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  orderDir?: 'ASC' | 'DESC';

  @IsOptional()
  @IsString()
  nameEn?: string;

  @IsOptional()
  @IsString()
  nameTh?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  searchTerm?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  createdAfter?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  createdBefore?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  updatedAfter?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  updatedBefore?: Date;
} 