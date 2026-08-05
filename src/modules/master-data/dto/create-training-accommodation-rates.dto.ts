import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsEnum, IsOptional } from 'class-validator';

export class CreateTrainingAccommodationRatesDto {
  @ApiProperty({ description: 'Travel type (DOMESTIC/INTERNATIONAL)' })
  @IsEnum(['DOMESTIC', 'INTERNATIONAL'])
  travelType: 'DOMESTIC' | 'INTERNATIONAL';

  @ApiProperty({ description: 'Training type (type-a/type-b/outsider)' })
  @IsEnum(['type-a', 'type-b', 'outsider'])
  trainingType: 'type-a' | 'type-b' | 'outsider';

  @ApiProperty({ description: 'Position name', required: false })
  @IsString()
  @IsOptional()
  positionName?: string;

  @ApiProperty({ description: 'Level code start', required: false })
  @IsString()
  @IsOptional()
  levelCodeStart?: string;

  @ApiProperty({ description: 'Level code end', required: false })
  @IsString()
  @IsOptional()
  levelCodeEnd?: string;

  @ApiProperty({ description: 'Position group name', required: false })
  @IsString()
  @IsOptional()
  positionGroupName?: string;

  @ApiProperty({ description: 'Rate mode (CHOICE/ACTUAL_ONLY/UNLIMITED)', required: false })
  @IsEnum(['CHOICE', 'ACTUAL_ONLY', 'UNLIMITED'])
  @IsOptional()
  rateMode?: 'CHOICE' | 'ACTUAL_ONLY' | 'UNLIMITED';

  @ApiProperty({ description: 'Country type (A/B/C)', required: false })
  @IsEnum(['A', 'B', 'C'])
  @IsOptional()
  countryType?: 'A' | 'B' | 'C';

  @ApiProperty({ description: 'Flat rate amount', required: false })
  @IsNumber()
  @IsOptional()
  flatRateAmount?: number;

  @ApiProperty({ description: 'Single room amount (ไม่เกิน)' })
  @IsNumber()
  singleRoomAmount: number;

  @ApiProperty({ description: 'Double room amount (ไม่เกิน)' })
  @IsNumber()
  doubleRoomAmount: number;
}
