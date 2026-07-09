import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsEnum, IsOptional } from 'class-validator';

export class UpdateTrainingAccommodationRatesDto {
  @ApiProperty({
    description: 'Travel type (DOMESTIC/INTERNATIONAL)',
    required: false,
  })
  @IsEnum(['DOMESTIC', 'INTERNATIONAL'])
  @IsOptional()
  travelType?: 'DOMESTIC' | 'INTERNATIONAL';

  @ApiProperty({
    description: 'Training type (type-a/type-b/outsider)',
    required: false,
  })
  @IsEnum(['type-a', 'type-b', 'outsider'])
  @IsOptional()
  trainingType?: 'type-a' | 'type-b' | 'outsider';

  @ApiProperty({ description: 'Single room amount (ไม่เกิน)', required: false })
  @IsNumber()
  @IsOptional()
  singleRoomAmount?: number;

  @ApiProperty({ description: 'Double room amount (ไม่เกิน)', required: false })
  @IsNumber()
  @IsOptional()
  doubleRoomAmount?: number;
}
