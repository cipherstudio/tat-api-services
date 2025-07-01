import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { CommonQueryDto } from '../../../common/dto/common-query.dtp';

export class QueryAbHolidayDto extends CommonQueryDto {
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
}
