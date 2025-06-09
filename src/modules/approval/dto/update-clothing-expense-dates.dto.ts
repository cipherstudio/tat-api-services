import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class UpdateClothingExpenseDatesDto {
  @ApiProperty({
    description: 'Reporting date',
    example: '2024-03-20',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  reportingDate?: string;

  @ApiProperty({
    description: 'Next claim date',
    example: '2024-09-20',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  nextClaimDate?: string;

  @ApiProperty({
    description: 'DD work end date',
    example: '2024-03-25',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  ddworkEndDate?: string;
} 