import { ApiProperty } from '@nestjs/swagger';

export class ReportDailyTravelDetail {
  @ApiProperty({ example: 1 })
  detailId: number;

  @ApiProperty({ example: 1 })
  formId: number;

  @ApiProperty({ example: 'Bangkok' })
  departurePlace: string;

  @ApiProperty({ example: '2025-07-10' })
  departureDate: Date;

  @ApiProperty({ example: '08:00' })
  departureTime: string;

  @ApiProperty({ example: 'Chiang Mai' })
  returnPlace: string;

  @ApiProperty({ example: '2025-07-12' })
  returnDate: Date;

  @ApiProperty({ example: '18:00' })
  returnTime: string;

  @ApiProperty({ example: 'รายละเอียดการเดินทาง' })
  travelDetails: string;

  constructor(partial: Partial<ReportDailyTravelDetail>) {
    Object.assign(this, partial);
  }
}
