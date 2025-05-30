import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdateExpensesVehicleDto {
  @ApiProperty({ description: 'The code of the expense vehicle' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: 'The title of the expense vehicle' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'The rate of the expense vehicle' })
  @IsNumber()
  @IsNotEmpty()
  rate: number;
} 