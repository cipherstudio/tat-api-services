import { IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CommonQueryDto } from '../../../common/dto/common-query.dtp';

export class HolidayWorkRatesQueryDto extends CommonQueryDto {
  @ApiProperty({ description: 'ขั้น/ระดับ', required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  step_level?: number;

  @ApiProperty({ description: 'เงินเดือน', required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  salary?: number;
}
