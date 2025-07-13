import { PartialType } from '@nestjs/swagger';
import { CreateReportTravellerDto } from './create-report-traveller.dto';

export class UpdateReportTravellerDto extends PartialType(
  CreateReportTravellerDto,
) {}
