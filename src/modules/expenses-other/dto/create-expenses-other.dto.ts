import { IsNotEmpty, IsString } from 'class-validator';

export class CreateExpensesOtherDto {
  @IsNotEmpty()
  @IsString()
  name: string;
} 