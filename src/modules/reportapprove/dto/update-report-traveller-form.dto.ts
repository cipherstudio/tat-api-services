import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateReportTravellerFormDto } from './create-report-traveller-form.dto';
import { UpdateReportTravellerDto } from './update-report-traveller.dto';
import { Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { UpdateReportDailyTravelDetailDto } from './report-daily-travel-detail.dto';

export class UpdateReportTravellerFormDto extends PartialType(
  CreateReportTravellerFormDto,
) {
  @ApiProperty({ example: 1 })
  @IsOptional()
  @IsNumber()
  form_id?: number;

  @ApiProperty({ type: UpdateReportTravellerDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateReportTravellerDto)
  traveller?: UpdateReportTravellerDto;

  @ApiProperty({ example: 'EMP001' })
  @IsOptional()
  @IsString()
  travelerCode?: string;

  @ApiProperty({ type: [UpdateReportDailyTravelDetailDto] })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateReportDailyTravelDetailDto)
  dailyTravelDetails?: UpdateReportDailyTravelDetailDto[];
}
