import { IsInt, IsOptional, IsDateString, IsNumber } from 'class-validator';

export class CreateReportHolidayWageDetailDto {
  // @IsInt()
  formId?: number;

  @IsDateString()
  @IsOptional()
  date?: string;

  @IsInt()
  @IsOptional()
  hours?: number;

  @IsInt()
  @IsOptional()
  year?: number;

  @IsNumber()
  @IsOptional()
  wage?: number;

  @IsNumber()
  @IsOptional()
  tax?: number;

  @IsNumber()
  @IsOptional()
  total?: number;
}
