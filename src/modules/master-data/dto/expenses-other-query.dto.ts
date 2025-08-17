import { IsOptional, IsString, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { CommonQueryDto } from '../../../common/dto/common-query.dtp';

export class ExpensesOtherQueryDto extends CommonQueryDto {
  @IsOptional()
  @IsString()
  name?: string;

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
