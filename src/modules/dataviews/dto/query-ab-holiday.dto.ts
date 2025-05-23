import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsNumber } from 'class-validator';

export class QueryAbHolidayDto {
  @ApiPropertyOptional({
    description: 'HOLIDAY_DATE',
    type: String,
    format: 'date-time',
  })
  @IsOptional()
  holidayDate?: Date;

  @ApiPropertyOptional({ description: 'POG_CODE' })
  @IsOptional()
  pogCode?: string;

  @ApiPropertyOptional({
    description: 'จำนวนรายการต่อหน้า (pagination)',
    type: Number,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit: number = 10;

  @ApiPropertyOptional({
    description: 'ข้ามกี่รายการ (pagination offset)',
    type: Number,
    default: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  offset: number = 0;
}
