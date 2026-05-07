import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, Min, IsOptional, IsInt } from 'class-validator';

export class CreateInternationalMovingAllowancesDto {
  @ApiProperty({
    description: 'Office international ID',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  officeId?: number;

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