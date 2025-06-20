import { PartialType } from '@nestjs/swagger';
import { CreateReportApproveDto } from './create-report-approve.dto';

export class UpdateReportApproveDto extends PartialType(
  CreateReportApproveDto,
) {}
