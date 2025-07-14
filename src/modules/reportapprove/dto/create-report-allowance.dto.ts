import { IsInt, IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateReportAllowanceDto {
  @IsInt()
  @IsOptional()
  formId?: number;

  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  subCategory?: string;

  @IsInt()
  @IsOptional()
  days?: number;

  @IsNumber()
  @IsOptional()
  total?: number;
}
