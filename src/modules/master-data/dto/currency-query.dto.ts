import { IsOptional, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CurrencyQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsString()
  orderBy?:
    | 'currencyTh'
    | 'currencyCodeTh'
    | 'currencyEn'
    | 'currencyCodeEn'
    | 'id';

  @IsOptional()
  @IsString()
  orderDir?: 'ASC' | 'DESC';

  @IsOptional()
  @IsString()
  currencyTh?: string;

  @IsOptional()
  @IsString()
  currencyCodeTh?: string;

  @IsOptional()
  @IsString()
  currencyEn?: string;

  @IsOptional()
  @IsString()
  currencyCodeEn?: string;

  @IsOptional()
  @IsString()
  searchTerm?: string;
}
