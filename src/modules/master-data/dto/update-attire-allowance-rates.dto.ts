import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsEnum, IsOptional } from 'class-validator';

export class UpdateAttireAllowanceRatesDto {
  @ApiProperty({ description: 'Assignment type', enum: ['TEMPORARY', 'PERMANENT'], required: false })
  @IsOptional()
  @IsEnum(['TEMPORARY', 'PERMANENT'])
  assignmentType?: 'TEMPORARY' | 'PERMANENT';

  @ApiProperty({ description: 'Position group name', required: false })
  @IsOptional()
  @IsString()
  positionGroupName?: string;

  @ApiProperty({ description: 'Position names (comma separated)', required: false })
  @IsOptional()
  @IsString()
  positionName?: string;

  @ApiProperty({ description: 'Level code start', required: false })
  @IsOptional()
  @IsNumber()
  levelCodeStart?: number;

  @ApiProperty({ description: 'Level code end', required: false })
  @IsOptional()
  @IsNumber()
  levelCodeEnd?: number;

  @ApiProperty({ description: 'Destination type', enum: ['A', 'B'], required: false })
  @IsOptional()
  @IsEnum(['A', 'B'])
  destinationType?: 'A' | 'B';

  @ApiProperty({ description: 'Rate in THB', required: false })
  @IsOptional()
  @IsNumber()
  rateThb?: number;

  @ApiProperty({ description: 'Spouse rate in THB', required: false })
  @IsOptional()
  @IsNumber()
  spouseRateThb?: number;

  @ApiProperty({ description: 'Child rate in THB', required: false })
  @IsOptional()
  @IsNumber()
  childRateThb?: number;
} 