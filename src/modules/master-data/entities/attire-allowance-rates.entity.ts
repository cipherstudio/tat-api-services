import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsEnum } from 'class-validator';

export class AttireAllowanceRates {
  @ApiProperty({ description: 'ID' })
  @IsNumber()
  id: number;

  @ApiProperty({
    description: 'Assignment type',
    enum: ['TEMPORARY', 'PERMANENT'],
  })
  @IsEnum(['TEMPORARY', 'PERMANENT'])
  assignmentType: 'TEMPORARY' | 'PERMANENT';

  @ApiProperty({ description: 'Position group name' })
  @IsString()
  positionGroupName: string;

  @ApiProperty({ description: 'Position names (comma separated)' })
  @IsString()
  positionName: string;

  @ApiProperty({ description: 'Level code start' })
  @IsNumber()
  levelCodeStart: number;

  @ApiProperty({ description: 'Level code end' })
  @IsNumber()
  levelCodeEnd: number;

  @ApiProperty({ description: 'Destination type', enum: ['A', 'B'] })
  @IsEnum(['A', 'B'])
  destinationType: 'A' | 'B';

  @ApiProperty({ description: 'Rate in THB' })
  @IsNumber()
  rateThb: number;

  @ApiProperty({ description: 'Spouse rate in THB' })
  @IsNumber()
  spouseRateThb: number;

  @ApiProperty({ description: 'Child rate in THB' })
  @IsNumber()
  childRateThb: number;

  @ApiProperty({ description: 'Created at timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at timestamp' })
  updatedAt: Date;
}

// Snake case to camel case mapping for database results
export const attireAllowanceRatesColumnMap = {
  id: 'id',
  assignment_type: 'assignmentType',
  position_group_name: 'positionGroupName',
  position_name: 'positionName',
  level_code_start: 'levelCodeStart',
  level_code_end: 'levelCodeEnd',
  destination_type: 'destinationType',
  rate_thb: 'rateThb',
  spouse_rate_thb: 'spouseRateThb',
  child_rate_thb: 'childRateThb',
  created_at: 'createdAt',
  updated_at: 'updatedAt',
};

// Camel case to snake case mapping for database inserts
export const attireAllowanceRatesReverseColumnMap = {
  id: 'id',
  assignmentType: 'assignment_type',
  positionGroupName: 'position_group_name',
  positionName: 'position_name',
  levelCodeStart: 'level_code_start',
  levelCodeEnd: 'level_code_end',
  destinationType: 'destination_type',
  rateThb: 'rate_thb',
  spouseRateThb: 'spouse_rate_thb',
  childRateThb: 'child_rate_thb',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
};
