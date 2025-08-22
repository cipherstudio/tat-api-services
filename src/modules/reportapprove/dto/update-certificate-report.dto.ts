import { PartialType } from '@nestjs/swagger';
import { CreateCertificateReportDto } from './create-certificate-report.dto';

export class UpdateCertificateReportDto extends PartialType(CreateCertificateReportDto) {}

