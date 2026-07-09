import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsEnum } from 'class-validator';

export class CreateTrainingAccommodationRatesDto {
  @ApiProperty({ description: 'Travel type (DOMESTIC/INTERNATIONAL)' })
  @IsEnum(['DOMESTIC', 'INTERNATIONAL'])
  travelType: 'DOMESTIC' | 'INTERNATIONAL';

  @ApiProperty({ description: 'Training type (type-a/type-b/outsider)' })
  @IsEnum(['type-a', 'type-b', 'outsider'])
  trainingType: 'type-a' | 'type-b' | 'outsider';

  @ApiProperty({ description: 'Single room amount (ไม่เกิน)' })
  @IsNumber()
  singleRoomAmount: number;

  @ApiProperty({ description: 'Double room amount (ไม่เกิน)' })
  @IsNumber()
  doubleRoomAmount: number;
}
