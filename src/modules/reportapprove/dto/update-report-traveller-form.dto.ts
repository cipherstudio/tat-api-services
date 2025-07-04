import { PartialType } from '@nestjs/swagger';
import { CreateReportTravellerFormDto } from './create-report-traveller-form.dto';

export class UpdateReportTravellerFormDto extends PartialType(
  CreateReportTravellerFormDto,
) {}
