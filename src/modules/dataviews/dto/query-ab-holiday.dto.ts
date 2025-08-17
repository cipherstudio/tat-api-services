import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { IsOptional, IsNumber, IsString } from 'class-validator';

export class DateRangeDto {
  @IsString()
  startDate: string;

  @IsString()
  endDate: string;
}

export class QueryAbHolidayDto {
  @ApiPropertyOptional({
    description: 'Simple start date (for single date range)',
    type: String,
    format: 'date',
    example: '2025-07-01',
  })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Simple end date (for single date range)',
    type: String,
    format: 'date',
    example: '2025-07-05',
  })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Date ranges JSON string - [{"startDate":"2025-07-01","endDate":"2025-07-05"},{"startDate":"2025-07-09","endDate":"2025-07-12"}]',
    type: String,
    example: '[{"startDate":"2025-07-01","endDate":"2025-07-05"},{"startDate":"2025-07-09","endDate":"2025-07-12"}]'
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          // Validate each range has required fields
          for (const range of parsed) {
            if (!range.startDate || !range.endDate) {
              return undefined;
            }
          }
          return parsed;
        }
      } catch (error) {
        // Invalid JSON, return undefined to fail validation
        return undefined;
      }
    }
    return value;
  })
  dateRanges?: DateRangeDto[];

  @ApiPropertyOptional({
    description: 'HOLIDAY_DATE (for backward compatibility)',
    type: String,
    format: 'date-time',
  })
  @IsOptional()
  holidayDate?: Date;

  @ApiPropertyOptional({ description: 'POG_CODE' })
  @IsOptional()
  @IsString()
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
