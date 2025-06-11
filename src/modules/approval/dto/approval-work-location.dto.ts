import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApprovalDateRangeDto } from './approval-date-range.dto';
import { ApprovalAccommodationExpenseDto } from './approval-accommodation-expense.dto';
import { ApprovalAccommodationTransportExpenseDto } from './approval-accommodation-transport-expense.dto';

export class ApprovalWorkLocationDto {
  @ApiProperty({
    description: 'Location of the work',
    example: 'Bangkok',
    required: false,
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({
    description: 'Destination of the work',
    example: 'Phuket',
    required: false,
  })
  @IsOptional()
  @IsString()
  destination?: string;

  @ApiProperty({
    description: 'Whether the work includes nearby provinces',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  nearbyProvinces?: boolean;

  @ApiProperty({
    description: 'Additional details about the work',
    example: 'Business trip for conference',
    required: false,
  })
  @IsOptional()
  @IsString()
  details?: string;

  @ApiProperty({
    description: 'Whether the work is checked',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  checked?: boolean;

  @ApiProperty({
    description: 'Type of destination',
    enum: ['domestic', 'international'],
    example: 'domestic',
    required: false,
  })
  @IsOptional()
  @IsEnum(['domestic', 'international'])
  destinationType?: 'domestic' | 'international';

  @ApiProperty({
    description: 'Date ranges for the work location',
    type: [ApprovalDateRangeDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApprovalDateRangeDto)
  tripDateRanges?: ApprovalDateRangeDto[];

  @ApiProperty({
    description: 'Accommodation expenses for this work location',
    type: [ApprovalAccommodationExpenseDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApprovalAccommodationExpenseDto)
  accommodationExpenses?: ApprovalAccommodationExpenseDto[];

  @ApiProperty({
    description: 'Accommodation transport expenses for this work location',
    type: [ApprovalAccommodationTransportExpenseDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApprovalAccommodationTransportExpenseDto)
  accommodationTransportExpenses?: ApprovalAccommodationTransportExpenseDto[];
} 