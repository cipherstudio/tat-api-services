import { IsOptional, IsString } from 'class-validator';
import { CommonQueryDto } from '../../../common/dto/common-query.dtp';

export class CurrencyQueryDto extends CommonQueryDto {
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
