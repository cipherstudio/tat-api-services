import {
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateHolidayWorkHourDto } from './create-holiday-work-rates.dto';

export class UpdateHolidayWorkHourDto extends CreateHolidayWorkHourDto {
  @ApiProperty({ description: 'ID ของชั่วโมง (ถ้ามี)', required: false })
  @IsOptional()
  @IsNumber()
  id?: number;
}

export class UpdateHolidayWorkRatesDto {
  @ApiProperty({ description: 'ขั้น/ระดับ', required: false })
  @IsOptional()
  @IsNumber()
  step_level?: number;

  @ApiProperty({ description: 'เงินเดือน', required: false })
  @IsOptional()
  @IsNumber()
  salary?: number;

  @ApiProperty({
    description: 'รายการชั่วโมงและค่าตอบแทน',
    type: [UpdateHolidayWorkHourDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateHolidayWorkHourDto)
  hours?: UpdateHolidayWorkHourDto[];
}
