import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class ApprovalEntertainmentExpenseDto {
  @ApiProperty({
    description: 'Whether short entertainment is checked',
    required: false,
    example: true
  })
  @IsOptional()
  @IsBoolean()
  entertainmentShortChecked?: boolean;

  @ApiProperty({
    description: 'Whether long entertainment is checked',
    required: false,
    example: false
  })
  @IsOptional()
  @IsBoolean()
  entertainmentLongChecked?: boolean;

  @ApiProperty({
    description: 'Amount of entertainment expense',
    required: false,
    example: 1000
  })
  @IsOptional()
  @IsNumber()
  entertainmentAmount?: number;

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
} 