import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class ApprovalAccommodationHolidayExpenseDto {
  @ApiProperty({
    description: 'Date of holiday',
    required: false,
    example: '2024-03-20'
  })
  @IsOptional()
  @IsString()
  date?: string;

  @ApiProperty({
    description: 'Thai date of holiday',
    required: false,
    example: 'วันอังคารที่ 3 มิถุนายน พ.ศ. 2568'
  })
  @IsOptional()
  @IsString()
  thaiDate?: string;

  @ApiProperty({
    description: 'Whether this holiday expense is checked',
    required: false,
    example: true
  })
  @IsOptional()
  @IsBoolean()
  checked?: boolean;

  @ApiProperty({
    description: 'Time of holiday',
    required: false,
    example: 'full'
  })
  @IsOptional()
  @IsString()
  time?: string;

  @ApiProperty({
    description: 'Hours of holiday',
    required: false,
    example: '1'
  })
  @IsOptional()
  @IsString()
  hours?: string;

  @ApiProperty({
    description: 'Total amount of holiday expense',
    required: false,
    example: 750
  })
  @IsOptional()
  @IsNumber()
  total?: number;

  @ApiProperty({
    description: 'Note for holiday expense',
    required: false,
    example: 'Public holiday'
  })
  @IsOptional()
  @IsString()
  note?: string;

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