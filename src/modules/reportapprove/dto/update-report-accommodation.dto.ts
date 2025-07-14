import { IsInt, IsOptional, IsString, IsNumber } from 'class-validator';

export class UpdateReportAccommodationDto {
  @IsInt()
  @IsOptional()
  accommodationId?: number;

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
