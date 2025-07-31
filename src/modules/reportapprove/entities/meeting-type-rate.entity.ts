import { ApiProperty } from '@nestjs/swagger';

export class MeetingTypeRate {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  meetingTypeId: number;

  @ApiProperty({ example: 'food', enum: ['food', 'snack'] })
  mealType: string;

  @ApiProperty({
    example: 'morning',
    enum: ['morning', 'lunch', 'dinner', 'afternoon'],
  })
  mealPeriod: string;

  @ApiProperty({ example: 150.0 })
  rate: number;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2024-01-01' })
  effectiveDate: Date;

  @ApiProperty({ example: '2024-12-31' })
  expiryDate?: Date;

  @ApiProperty({ example: '2024-06-21T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-06-21T10:00:00.000Z' })
  updatedAt: Date;

  constructor(partial: Partial<MeetingTypeRate>) {
    Object.assign(this, partial);
  }
}
