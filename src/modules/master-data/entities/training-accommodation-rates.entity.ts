import { ApiProperty } from '@nestjs/swagger';

export class TrainingAccommodationRates {
  @ApiProperty({ description: 'Unique identifier' })
  id: number;

  @ApiProperty({ description: 'Travel type (DOMESTIC/INTERNATIONAL)' })
  travelType: 'DOMESTIC' | 'INTERNATIONAL';

  @ApiProperty({ description: 'Training type (type-a/type-b/outsider)' })
  trainingType: 'type-a' | 'type-b' | 'outsider';

  @ApiProperty({ description: 'Position name', required: false })
  positionName?: string;

  @ApiProperty({ description: 'Level code start', required: false })
  levelCodeStart?: string;

  @ApiProperty({ description: 'Level code end', required: false })
  levelCodeEnd?: string;

  @ApiProperty({ description: 'Position group name', required: false })
  positionGroupName?: string;

  @ApiProperty({ description: 'Rate mode (CHOICE/ACTUAL_ONLY/UNLIMITED)', required: false })
  rateMode?: 'CHOICE' | 'ACTUAL_ONLY' | 'UNLIMITED';

  @ApiProperty({ description: 'Country type (A/B), null = ประเภท ค.', required: false })
  countryType?: 'A' | 'B';

  @ApiProperty({ description: 'Flat rate amount (อัตราเหมาจ่าย)', required: false })
  flatRateAmount?: number;

  @ApiProperty({ description: 'Single room amount (เท่าที่จ่ายจริง)' })
  singleRoomAmount: number;

  @ApiProperty({ description: 'Double room amount (เท่าที่จ่ายจริง)' })
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
  positionName: 'position_name',
  levelCodeStart: 'level_code_start',
  levelCodeEnd: 'level_code_end',
  positionGroupName: 'position_group_name',
  rateMode: 'rate_mode',
  countryType: 'country_type',
  flatRateAmount: 'flat_rate_amount',
  singleRoomAmount: 'single_room_amount',
  doubleRoomAmount: 'double_room_amount',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
};

export const trainingAccommodationRatesReverseColumnMap = {
  id: 'id',
  travel_type: 'travelType',
  training_type: 'trainingType',
  position_name: 'positionName',
  level_code_start: 'levelCodeStart',
  level_code_end: 'levelCodeEnd',
  position_group_name: 'positionGroupName',
  rate_mode: 'rateMode',
  country_type: 'countryType',
  flat_rate_amount: 'flatRateAmount',
  single_room_amount: 'singleRoomAmount',
  double_room_amount: 'doubleRoomAmount',
  created_at: 'createdAt',
  updated_at: 'updatedAt',
};
