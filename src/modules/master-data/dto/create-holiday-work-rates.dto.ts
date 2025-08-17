import { IsNumber, IsArray, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateHolidayWorkHourDto {
  @IsNumber()
  @Min(1)
  @Max(8)
  hour: number;

  @IsNumber()
  work_pay: number;

  @IsNumber()
  tax_rate: number;
}

export class CreateHolidayWorkRatesDto {
  @IsNumber()
  step_level: number;

  @IsNumber()
  salary: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateHolidayWorkHourDto)
  hours: CreateHolidayWorkHourDto[];
}
