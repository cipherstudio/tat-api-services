import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsEnum, IsOptional } from 'class-validator';

export class CreateAttireAllowanceRatesDto {
  @ApiProperty({ description: 'Assignment type', enum: ['TEMPORARY', 'PERMANENT'] })
  @IsEnum(['TEMPORARY', 'PERMANENT'])
  assignmentType: 'TEMPORARY' | 'PERMANENT';

  @ApiProperty({ description: 'Position names (comma separated)' })
  @IsString()
  positionName: string;

  @ApiProperty({ description: 'Level code start' })
  @IsString()
  levelCodeStart: string;

  @ApiProperty({ description: 'Level code end' })
  @IsString()
  levelCodeEnd: string;

  @ApiProperty({ description: 'Destination group code (null for default)', required: false })
  @IsOptional()
  @IsString()
  destinationGroupCode?: string;

  @ApiProperty({ description: 'Rate in THB' })
  @IsNumber()
  rateThb: number;

  @ApiProperty({ description: 'Spouse rate in THB' })
  @IsNumber()
  spouseRateThb: number;

  @ApiProperty({ description: 'Child rate in THB' })
  @IsNumber()
  childRateThb: number;
} 