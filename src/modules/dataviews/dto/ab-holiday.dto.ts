import { ApiProperty } from '@nestjs/swagger';

export class AbHolidayDto {
  @ApiProperty({ type: String, format: 'date-time' })
  holidayDate: Date;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ type: String, format: 'date-time' })
  createDate: Date;

  @ApiProperty({ required: false })
  psnCode?: string;

  @ApiProperty({ required: false })
  pogCode?: string;

  @ApiProperty({ required: false })
  holidayFlag?: string;

  @ApiProperty({ required: false })
  pogType?: number;

  @ApiProperty({ required: false })
  id?: number;
}
