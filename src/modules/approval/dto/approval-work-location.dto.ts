import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApprovalDateRangeDto } from './approval-date-range.dto';

export class ApprovalWorkLocationDto {
  @ApiProperty({
    description: 'ID of the staff member',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  staffMemberId?: number;

  @ApiProperty({
    description: 'ID of the approval',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  approvalId?: number;

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
  dateRanges?: ApprovalDateRangeDto[];
} 