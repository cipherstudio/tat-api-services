import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class ApprovalAccommodationTransportExpenseDto {
  @ApiProperty({
    description: 'Type of transport expense',
    required: false,
    example: 'flight'
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({
    description: 'Amount of transport expense',
    required: false,
    example: 5000
  })
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiProperty({
    description: 'Whether this transport expense is checked',
    required: false,
    example: true
  })
  @IsOptional()
  @IsBoolean()
  checked?: boolean;

  @ApiProperty({
    description: 'Flight route for air travel',
    required: false,
    example: 'BKK-PHUKET'
  })
  @IsOptional()
  @IsString()
  flightRoute?: string;

  @ApiProperty({
    description: 'ID of the approval accommodation expense',
    required: false,
    example: 1
  })
  @IsOptional()
  @IsNumber()
  approvalAccommodationExpenseId?: number;

  @ApiProperty({
    description: 'ID of the approval',
    required: false,
    example: 1
  })
  @IsOptional()
  @IsNumber()
  approvalId?: number;
} 