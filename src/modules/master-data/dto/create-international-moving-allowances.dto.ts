import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, Min } from 'class-validator';

export class CreateInternationalMovingAllowancesDto {
  @ApiProperty({ description: 'Office name' })
  @IsString()
  office: string;

  @ApiProperty({ description: 'Currency' })
  @IsString()
  currency: string;

  @ApiProperty({ description: 'Director salary' })
  @IsNumber()
  @Min(0)
  directorSalary: number;

  @ApiProperty({ description: 'Deputy director salary' })
  @IsNumber()
  @Min(0)
  deputyDirectorSalary: number;
} 