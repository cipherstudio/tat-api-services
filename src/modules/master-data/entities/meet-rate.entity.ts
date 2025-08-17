import { ApiProperty } from '@nestjs/swagger';

export class MeetRate {
  @ApiProperty({ description: 'Unique identifier' })
  id: number;

  @ApiProperty({ description: 'Meeting type' })
  type: string;

  @ApiProperty({ description: 'Food rate amount' })
  food: number;

  @ApiProperty({ description: 'Snack rate amount' })
  snack: number;

  @ApiProperty({ description: 'Created at timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at timestamp' })
  updatedAt: Date;
}

export const meetRateColumnMap = {
  id: 'id',
  type: 'type',
  food: 'food',
  snack: 'snack',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
};

export const meetRateReverseColumnMap = {
  id: 'id',
  type: 'type',
  food: 'food',
  snack: 'snack',
  created_at: 'createdAt',
  updated_at: 'updatedAt',
};
