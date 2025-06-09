import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, ValidateNested, IsBoolean, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApprovalDateRangeDto } from './approval-date-range.dto';

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
}

export class ApprovalStaffMemberDto {
  @ApiProperty({
    description: 'Employee code',
    example: 'EMP001',
    required: false,
  })
  @IsOptional()
  @IsString()
  employeeCode?: string;

  @ApiProperty({
    description: 'Type of staff member',
    example: 'Full-time',
    required: false,
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({
    description: 'Name of staff member',
    example: 'John Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Role of staff member',
    example: 'Developer',
    required: false,
  })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiProperty({
    description: 'Position of staff member',
    example: 'Senior Developer',
    required: false,
  })
  @IsOptional()
  @IsString()
  position?: string;

  @ApiProperty({
    description: 'Right equivalent of staff member',
    example: 'C5',
    required: false,
  })
  @IsOptional()
  @IsString()
  rightEquivalent?: string;

  @ApiProperty({
    description: 'Organization position of staff member',
    example: 'IT Department',
    required: false,
  })
  @IsOptional()
  @IsString()
  organizationPosition?: string;

  @ApiProperty({
    description: 'Work locations for the staff member',
    type: [ApprovalWorkLocationDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApprovalWorkLocationDto)
  workLocations?: ApprovalWorkLocationDto[];
} 