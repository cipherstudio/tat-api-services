import { PartialType } from '@nestjs/swagger';
import { CreateReportSettingsDto } from './create-report-settings.dto';

export class UpdateReportSettingsDto extends PartialType(CreateReportSettingsDto) {}
