import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class ApprovalClothingExpenseDto {
  @ApiProperty({
    description: 'Whether clothing file is checked',
    required: false,
    example: true
  })
  @IsOptional()
  @IsBoolean()
  clothingFileChecked?: boolean;

  @ApiProperty({
    description: 'Amount of clothing expense',
    required: false,
    example: 1000
  })
  @IsOptional()
  @IsNumber()
  clothingAmount?: number;

  @ApiProperty({
    description: 'Reason for clothing expense',
    required: false,
    example: 'New uniform required'
  })
  @IsOptional()
  @IsString()
  clothingReason?: string;

  @ApiProperty({
    description: 'Reporting date',
    required: false,
    example: '2024-03-20'
  })
  @IsOptional()
  @IsString()
  reportingDate?: string;

  @ApiProperty({
    description: 'Next claim date',
    required: false,
    example: '2024-09-20'
  })
  @IsOptional()
  @IsString()
  nextClaimDate?: string;

  @ApiProperty({
    description: 'Work end date',
    required: false,
    example: '2024-12-31'
  })
  @IsOptional()
  @IsString()
  workEndDate?: string;

  @ApiProperty({
    description: 'ID of the staff member',
    required: false,
    example: 1
  })
  @IsOptional()
  @IsNumber()
  staffMemberId?: number;

  @ApiProperty({
    description: 'ID of the approval',
    required: false,
    example: 1
  })
  @IsOptional()
  @IsNumber()
  approvalId?: number;

  @ApiProperty({
    description: 'Employee code',
    required: false,
    example: '66019'
  })
  @IsOptional()
  @IsString()
  employeeCode?: string;
} 