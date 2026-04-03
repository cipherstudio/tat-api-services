import { ApiProperty } from '@nestjs/swagger';

export class ReportCertificateExchangeRate {
  @ApiProperty()
  id: number;

  @ApiProperty()
  report_certificate_id: number;

  @ApiProperty({ required: false })
  country?: string;

  @ApiProperty({ required: false })
  currency_label?: string;

  @ApiProperty({ required: false })
  currency_code_en?: string;

  @ApiProperty({ required: false })
  exchange_rate?: number;

  @ApiProperty({ required: false })
  display_order?: number;

  @ApiProperty({ required: false })
  created_at?: Date;

  @ApiProperty({ required: false })
  updated_at?: Date;
}
