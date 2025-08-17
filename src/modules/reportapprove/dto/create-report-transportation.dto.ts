import {
  IsInt,
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
} from 'class-validator';

export class CreateReportTransportationDto {
  @IsInt()
  @IsOptional()
  formId?: number;

  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  fromPlace?: string;

  @IsString()
  @IsOptional()
  toPlace?: string;

  @IsDateString()
  @IsOptional()
  date?: string;

  @IsNumber()
  @IsOptional()
  amount?: number;

  @IsString()
  @IsOptional()
  receiptFilePath?: string;
}
