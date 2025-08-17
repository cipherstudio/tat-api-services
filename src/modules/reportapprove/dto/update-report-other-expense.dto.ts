import { IsInt, IsOptional, IsString, IsNumber } from 'class-validator';

export class UpdateReportOtherExpenseDto {
  @IsInt()
  @IsOptional()
  expenseId?: number;

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
