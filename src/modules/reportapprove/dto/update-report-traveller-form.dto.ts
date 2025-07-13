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
import { UpdateReportHolidayWageDetailDto } from './update-report-holiday-wage-detail.dto';
import { UpdateReportAccommodationDto } from './update-report-accommodation.dto';
import { UpdateReportOtherExpenseDto } from './update-report-other-expense.dto';
import { UpdateReportTransportationDto } from './update-report-transportation.dto';

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

  @ApiProperty({ type: [UpdateReportHolidayWageDetailDto] })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateReportHolidayWageDetailDto)
  holidayWageDetailDaily?: UpdateReportHolidayWageDetailDto[];

  @ApiProperty({ type: [UpdateReportAccommodationDto] })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateReportAccommodationDto)
  accommodationDetails?: UpdateReportAccommodationDto[];

  @ApiProperty({ type: [UpdateReportOtherExpenseDto] })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateReportOtherExpenseDto)
  otherExpenseDetails?: UpdateReportOtherExpenseDto[];

  @ApiProperty({ type: [UpdateReportTransportationDto] })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateReportTransportationDto)
  transportationDetails?: UpdateReportTransportationDto[];
}
