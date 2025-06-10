import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class OtherExpenseDto {
  @ApiProperty({ description: 'Type of expense', required: true })
  @IsString()
  type: string;

  @ApiProperty({ description: 'Amount of expense', required: true })
  @IsNumber()
  amount: number;

  @ApiProperty({ description: 'Position', required: false })
  @IsOptional()
  @IsString()
  position?: string;

  @ApiProperty({ description: 'Reason for expense', required: false })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiProperty({ description: 'Whether the expense is acknowledged', required: false })
  @IsOptional()
  @IsBoolean()
  acknowledged?: boolean;
} 