import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsEnum } from 'class-validator';

export class CreateAttireAllowanceRatesDto {
  @ApiProperty({ description: 'Assignment type', enum: ['TEMPORARY', 'PERMANENT'] })
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
} 