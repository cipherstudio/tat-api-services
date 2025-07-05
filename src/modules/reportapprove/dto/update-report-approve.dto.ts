import { PartialType } from '@nestjs/swagger';
import { CreateReportApproveDto } from './create-report-approve.dto';
import { UpdateReportTravellerFormDto } from './update-report-traveller-form.dto';
// import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateReportApproveDto extends PartialType(
  CreateReportApproveDto,
) {
  @ApiProperty({ type: [UpdateReportTravellerFormDto] })
  @IsOptional()
  // @IsArray()
  // @ValidateNested({ each: true })
  // @Type(() => UpdateReportTravellerFormDto)
  reportTravellerForm?: UpdateReportTravellerFormDto[];
}
