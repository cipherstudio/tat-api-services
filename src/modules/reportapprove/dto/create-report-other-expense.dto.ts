import { IsInt, IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateReportOtherExpenseDto {
  @IsInt()
  @IsOptional()
  formId?: number;

  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @IsOptional()
  amount?: number;

  @IsString()
  @IsOptional()
  certificateFilePath?: string;
}
