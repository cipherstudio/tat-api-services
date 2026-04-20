import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateExpensesOtherDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  accountExpenseCode?: string;
} 