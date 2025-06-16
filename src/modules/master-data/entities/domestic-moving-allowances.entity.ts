import { ApiProperty } from '@nestjs/swagger';

export class DomesticMovingAllowances {
  @ApiProperty({ description: 'Unique identifier' })
  id: number;

  @ApiProperty({ description: 'Distance start in kilometers' })
  distanceStartKm: number;

  @ApiProperty({ description: 'Distance end in kilometers' })
  distanceEndKm: number;

  @ApiProperty({ description: 'Rate in Thai Baht' })
  rateBaht: number;

  @ApiProperty({ description: 'Created at timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at timestamp' })
  updatedAt: Date;
}

export const domesticMovingAllowancesColumnMap = {
  id: 'id',
  distanceStartKm: 'distance_start_km',
  distanceEndKm: 'distance_end_km',
  rateBaht: 'rate_baht',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
};

export const domesticMovingAllowancesReverseColumnMap = {
  id: 'id',
  distance_start_km: 'distanceStartKm',
  distance_end_km: 'distanceEndKm',
  rate_baht: 'rateBaht',
  created_at: 'createdAt',
  updated_at: 'updatedAt',
}; 