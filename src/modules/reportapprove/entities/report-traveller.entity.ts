import { ApiProperty } from '@nestjs/swagger';
import { ReportApprove } from './report-approve.entity';
import { ReportTravellerForm } from './report-traveller-form.entity';

export class ReportTraveller {
  @ApiProperty({ example: 1 })
  traveler_id: number;

  @ApiProperty({ example: 'RPT-2024-001' })
  report_id: number;

  @ApiProperty({ example: 'John Doe' })
  name: string;

  @ApiProperty({ example: 'Manager' })
  position: string;

  @ApiProperty({ example: 'Senior' })
  level: string;

  @ApiProperty({ example: 'Official' })
  type: string;

  @ApiProperty({ example: '2024-07-03T10:00:00.000Z' })
  created_at: Date;

  @ApiProperty({ example: '2024-07-03T10:00:00.000Z' })
  updated_at: Date;

  // Relations
  report?: ReportApprove;
  forms?: ReportTravellerForm[];

  constructor(partial: Partial<ReportTraveller>) {
    Object.assign(this, partial);
  }
}
