import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsEnum, IsOptional } from 'class-validator';

export class CreateAccommodationRatesDto {
  @ApiProperty({ description: 'Travel type (DOMESTIC/INTERNATIONAL)' })
  @IsEnum(['DOMESTIC', 'INTERNATIONAL'])
  travelType: 'DOMESTIC' | 'INTERNATIONAL';

  @ApiProperty({ description: 'Position name' })
  @IsString()
  positionName: string;

  @ApiProperty({ description: 'Level code start', required: false })
  @IsString()
  @IsOptional()
  levelCodeStart?: string;

  @ApiProperty({ description: 'Level code end', required: false })
  @IsString()
  @IsOptional()
  levelCodeEnd?: string;

  @ApiProperty({ description: 'Position group name' })
  @IsString()
  positionGroupName: string;

  @ApiProperty({ description: 'Rate mode (CHOICE/ACTUAL_ONLY/UNLIMITED)' })
  @IsEnum(['CHOICE', 'ACTUAL_ONLY', 'UNLIMITED'])
  rateMode: 'CHOICE' | 'ACTUAL_ONLY' | 'UNLIMITED';

  @ApiProperty({ description: 'Country type (A/B)', required: false })
  @IsEnum(['A', 'B'])
  @IsOptional()
  countryType?: 'A' | 'B';

  @ApiProperty({ description: 'Flat rate amount', required: false })
  @IsNumber()
  @IsOptional()
  flatRateAmount?: number;

  @ApiProperty({ description: 'Single room amount', required: false })
  @IsNumber()
  @IsOptional()
  singleRoomAmount?: number;

  @ApiProperty({ description: 'Double room percentage', required: false })
  @IsNumber()
  @IsOptional()
  doubleRoomPercentage?: number;
} 