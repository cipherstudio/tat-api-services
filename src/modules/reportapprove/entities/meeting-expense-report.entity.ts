import { ApiProperty } from '@nestjs/swagger';

export class MeetingExpenseReport {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'IT Department' })
  department: string;

  @ApiProperty({ example: 'Development Team' })
  section: string;

  @ApiProperty({ example: 'Project Alpha' })
  job: string;

  @ApiProperty({ example: 'EMP001' })
  employeeId: string;

  @ApiProperty({ example: 'John Doe' })
  name: string;

  @ApiProperty({ example: 'Manager' })
  position: string;

  @ApiProperty({ example: 'การประชุมวางแผนงานประจำเดือน' })
  topic: string;

  @ApiProperty({ example: 'ห้องประชุมใหญ่' })
  place: string;

  @ApiProperty({ example: 'ประชุมประจำเดือน' })
  meetingType: string;

  @ApiProperty({ example: 'ดร.สมชาย ใจดี' })
  chairman?: string;

  @ApiProperty({ example: '15 คน' })
  attendees: string;

  @ApiProperty({ example: '2024-06-21' })
  meetingDate: Date;

  @ApiProperty({ example: 5000.0 })
  totalAmount: number;

  @ApiProperty({
    example: 'draft',
    enum: ['draft', 'pending', 'approved', 'rejected'],
  })
  status: string;

  @ApiProperty({ example: 'รอการอนุมัติ' })
  statusDescription?: string;

  @ApiProperty({ example: 'EMP001' })
  createdBy?: string;

  @ApiProperty({ example: '2024-06-21T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-06-21T10:00:00.000Z' })
  updatedAt: Date;

  @ApiProperty({ example: null })
  deletedAt?: Date;

  constructor(partial: Partial<MeetingExpenseReport>) {
    Object.assign(this, partial);
  }
}
