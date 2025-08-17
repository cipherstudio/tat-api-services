import { IsInt, IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateReportAccommodationDto {
  @IsInt()
  @IsOptional()
  formId?: number;

  @IsString()
  @IsOptional()
  type?: string;

  @IsNumber()
  @IsOptional()
  pricePerDay?: number;

  @IsInt()
  @IsOptional()
  days?: number;

  @IsNumber()
  @IsOptional()
  total?: number;
}
