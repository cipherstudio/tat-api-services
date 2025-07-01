import { IsOptional, IsString, IsNumber, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { CommonQueryDto } from '../../../common/dto/common-query.dtp';

export class OfficeInternationalQueryDto extends CommonQueryDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  pogCode?: string;

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
