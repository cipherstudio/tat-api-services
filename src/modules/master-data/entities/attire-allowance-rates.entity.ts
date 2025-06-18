import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsEnum, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class AttireDestinationGroupInfo {
  @ApiProperty({ description: 'Group ID' })
  @IsNumber()
  id: number;

  @ApiProperty({ description: 'Group code' })
  @IsString()
  groupCode: string;

  @ApiProperty({ description: 'Group name' })
  @IsString()
  groupName: string;

  @ApiProperty({
    description: 'Assignment type',
    enum: ['TEMPORARY', 'PERMANENT'],
  })
  @IsEnum(['TEMPORARY', 'PERMANENT'])
  assignmentType: 'TEMPORARY' | 'PERMANENT';

  @ApiProperty({ description: 'Description', required: false })
  @IsString()
  description?: string;
}

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

  @ApiProperty({ description: 'Position names (comma separated)' })
  @IsString()
  positionName: string;

  @ApiProperty({ description: 'Level code start' })
  @IsNumber()
  levelCodeStart: string;

  @ApiProperty({ description: 'Level code end' })
  @IsNumber()
  levelCodeEnd: string;

  @ApiProperty({ description: 'Destination group code (null for default)', required: false })
  @IsOptional()
  @IsString()
  destinationGroupCode?: string;

  @ApiProperty({ description: 'Destination group information', required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => AttireDestinationGroupInfo)
  destinationGroup?: AttireDestinationGroupInfo;

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
  position_name: 'positionName',
  level_code_start: 'levelCodeStart',
  level_code_end: 'levelCodeEnd',
  destination_group_code: 'destinationGroupCode',
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
  positionName: 'position_name',
  levelCodeStart: 'level_code_start',
  levelCodeEnd: 'level_code_end',
  destinationGroupCode: 'destination_group_code',
  rateThb: 'rate_thb',
  spouseRateThb: 'spouse_rate_thb',
  childRateThb: 'child_rate_thb',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
};
