import { ApiProperty } from '@nestjs/swagger';
import { ReportTraveller } from './report-traveller.entity';
import { ReportApprove } from './report-approve.entity';

export class ReportTravellerForm {
  @ApiProperty({ example: 'FORM-2024-001' })
  form_id: string;

  @ApiProperty({ example: 1 })
  traveler_id: number;

  @ApiProperty({ example: 'RPT-2024-001' })
  report_id: string;

  @ApiProperty({ example: 'Developer' })
  job: string;

  @ApiProperty({ example: 'IT Department' })
  department: string;

  @ApiProperty({ example: '2024-07-03' })
  date: Date;

  @ApiProperty({ example: 'TO-2024-001' })
  travel_order: string;

  @ApiProperty({ example: '2024-07-01' })
  travel_order_date: Date;

  @ApiProperty({ example: 'Jane Doe, Bob Smith' })
  companions: string;

  @ApiProperty({ example: 'Tokyo' })
  destination: string;

  @ApiProperty({ example: 'Shibuya' })
  location: string;

  @ApiProperty({ example: 'Bangkok' })
  departure_place: string;

  @ApiProperty({ example: '2024-07-02' })
  departure_date: Date;

  @ApiProperty({ example: '08:00' })
  departure_time: string;

  @ApiProperty({ example: 'Bangkok' })
  return_place: string;

  @ApiProperty({ example: '2024-07-05' })
  return_date: Date;

  @ApiProperty({ example: '18:00' })
  return_time: string;

  @ApiProperty({ example: '5 days 10 hours' })
  total_time: string;

  @ApiProperty({ example: 'Business trip details' })
  travel_details: string;

  @ApiProperty({ example: 50000.0 })
  gran_total: number;

  @ApiProperty({ example: 40000.0 })
  request_approve_amount: number;

  @ApiProperty({ example: 10000.0 })
  remain_amount: number;

  @ApiProperty({ example: '2024-07-03T10:00:00.000Z' })
  created_at: Date;

  @ApiProperty({ example: '2024-07-03T10:00:00.000Z' })
  updated_at: Date;

  // Relations
  traveller?: ReportTraveller;
  report?: ReportApprove;

  constructor(partial: Partial<ReportTravellerForm>) {
    Object.assign(this, partial);
  }
}
