import { ApiProperty } from '@nestjs/swagger';

export class AccommodationRates {
  @ApiProperty({ description: 'Unique identifier' })
  id: number;

  @ApiProperty({ description: 'Travel type (DOMESTIC/INTERNATIONAL)' })
  travelType: 'DOMESTIC' | 'INTERNATIONAL';

  @ApiProperty({ description: 'Position name' })
  positionName: string;

  @ApiProperty({ description: 'Level code start' })
  levelCodeStart: string;

  @ApiProperty({ description: 'Level code end' })
  levelCodeEnd: string;

  @ApiProperty({ description: 'Position group name' })
  positionGroupName: string;

  @ApiProperty({ description: 'Rate mode (CHOICE/ACTUAL_ONLY/UNLIMITED)' })
  rateMode: 'CHOICE' | 'ACTUAL_ONLY' | 'UNLIMITED';

  @ApiProperty({ description: 'Flat rate amount', required: false })
  flatRateAmount?: number;

  @ApiProperty({ description: 'Single room amount', required: false })
  singleRoomAmount?: number;

  @ApiProperty({ description: 'Double room percentage', required: false })
  doubleRoomPercentage?: number;

  @ApiProperty({ description: 'Created at timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at timestamp' })
  updatedAt: Date;
}

export const accommodationRatesColumnMap = {
  id: 'id',
  travelType: 'travel_type',
  positionName: 'position_name',
  levelCodeStart: 'level_code_start',
  levelCodeEnd: 'level_code_end',
  positionGroupName: 'position_group_name',
  rateMode: 'rate_mode',
  flatRateAmount: 'flat_rate_amount',
  singleRoomAmount: 'single_room_amount',
  doubleRoomPercentage: 'double_room_percentage',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
};

export const accommodationRatesReverseColumnMap = {
  id: 'id',
  travel_type: 'travelType',
  position_name: 'positionName',
  level_code_start: 'levelCodeStart',
  level_code_end: 'levelCodeEnd',
  position_group_name: 'positionGroupName',
  rate_mode: 'rateMode',
  flat_rate_amount: 'flatRateAmount',
  single_room_amount: 'singleRoomAmount',
  double_room_percentage: 'doubleRoomPercentage',
  created_at: 'createdAt',
  updated_at: 'updatedAt',
}; 