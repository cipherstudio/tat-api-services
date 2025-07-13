import { IsInt, IsOptional, IsNumber } from 'class-validator';

export class UpdateReportHolidayWageDetailDto {
  // @IsInt()
  holidayId?: number;

  // @IsInt()
  @IsOptional()
  formId?: number;

  // @IsDate()
  @IsOptional()
  date?: Date;

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
