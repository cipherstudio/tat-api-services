import { ApiProperty } from '@nestjs/swagger';

export class MeetingExpenseReportFoodRow {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  meetingExpenseReportId: number;

  @ApiProperty({ example: 'morning', enum: ['morning', 'lunch', 'dinner'] })
  mealType: string;

  @ApiProperty({ example: 'เช้า' })
  mealName: string;

  @ApiProperty({ example: true })
  checked: boolean;

  @ApiProperty({ example: 150.0 })
  rate: number;

  @ApiProperty({ example: 1500.0 })
  amount: number;

  @ApiProperty({ example: 'R001' })
  receipt?: string;

  @ApiProperty({ example: '2024-06-21' })
  receiptDate?: Date;

  @ApiProperty({ example: '2024-06-21T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-06-21T10:00:00.000Z' })
  updatedAt: Date;

  constructor(partial: Partial<MeetingExpenseReportFoodRow>) {
    Object.assign(this, partial);
  }
}
