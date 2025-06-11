import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApprovalWorkLocationDto } from './approval-work-location.dto';

export class ApprovalStaffMemberDto {
  @ApiProperty({
    description: 'Employee code',
    example: '66019',
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