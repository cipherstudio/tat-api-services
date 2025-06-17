import { IsOptional, IsString, IsNumber, IsDate, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class OfficeInternationalQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsEnum(['name', 'region', 'id', 'countryId', 'currencyId', 'createdAt', 'updatedAt'])
  orderBy?: 'name' | 'region' | 'id' | 'countryId' | 'currencyId' | 'createdAt' | 'updatedAt';

  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  orderDir?: 'ASC' | 'DESC';

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  countryId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  currencyId?: number;

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