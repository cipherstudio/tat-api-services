import { ApiProperty } from '@nestjs/swagger';

export class TrainingAccommodationRates {
  @ApiProperty({ description: 'Unique identifier' })
  id: number;

  @ApiProperty({ description: 'Travel type (DOMESTIC/INTERNATIONAL)' })
  travelType: 'DOMESTIC' | 'INTERNATIONAL';

  @ApiProperty({ description: 'Training type (type-a/type-b/outsider)' })
  trainingType: 'type-a' | 'type-b' | 'outsider';

  @ApiProperty({ description: 'Single room amount (ไม่เกิน)' })
  singleRoomAmount: number;

  @ApiProperty({ description: 'Double room amount (ไม่เกิน)' })
  doubleRoomAmount: number;

  @ApiProperty({ description: 'Created at timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at timestamp' })
  updatedAt: Date;
}

export const trainingAccommodationRatesColumnMap = {
  id: 'id',
  travelType: 'travel_type',
  trainingType: 'training_type',
  singleRoomAmount: 'single_room_amount',
  doubleRoomAmount: 'double_room_amount',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
};

export const trainingAccommodationRatesReverseColumnMap = {
  id: 'id',
  travel_type: 'travelType',
  training_type: 'trainingType',
  single_room_amount: 'singleRoomAmount',
  double_room_amount: 'doubleRoomAmount',
  created_at: 'createdAt',
  updated_at: 'updatedAt',
};
