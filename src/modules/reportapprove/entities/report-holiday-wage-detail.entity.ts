import { ApiProperty } from '@nestjs/swagger';

export class ReportHolidayWageDetail {
  @ApiProperty({ example: 1 })
  holidayId: number;

  @ApiProperty({ example: 1 })
  formId: number;

  @ApiProperty({ example: '2025-07-10' })
  date?: Date;

  @ApiProperty({ example: 8 })
  hours?: number;

  @ApiProperty({ example: 2025 })
  year?: number;

  @ApiProperty({ example: 1000 })
  wage?: number;

  @ApiProperty({ example: 100 })
  tax?: number;

  @ApiProperty({ example: 1100 })
  total?: number;
}
