import { ApiProperty } from '@nestjs/swagger';

export class ReportEntertainmentForm {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'EMP001' })
  employeeId: string;

  @ApiProperty({ example: 'John Doe' })
  employeeName: string;

  @ApiProperty({ example: 'Manager' })
  employeePosition: string;

  @ApiProperty({ example: 'IT Department' })
  department: string;

  @ApiProperty({ example: 'Development Team' })
  section: string;

  @ApiProperty({ example: 'Project Alpha' })
  job: string;

  @ApiProperty({ example: 'พนักงาน ททท.', description: 'Employee type (พนักงาน ททท., ผู้ว่าการ)' })
  employeeType: string;

  @ApiProperty({ example: 'รายครั้ง', description: 'Type of entertainment (รายครั้ง, ประจำเดือน)' })
  entertainmentType: string;

  @ApiProperty({ example: 'มกราคม', description: 'เดือนที่ทำรายงาน' })
  month: string;

  @ApiProperty({ example: 1 })
  statusId: number;

  @ApiProperty({ example: 15000.0 })
  totalAmount: number;

  @ApiProperty({ example: 'APP001' })
  approvedBy: string;

  @ApiProperty({ example: '2024-06-21T10:00:00.000Z' })
  approvedAt: Date;

  @ApiProperty({ example: 'อนุมัติแล้ว' })
  approvedComment: string;

  @ApiProperty({ example: 'EMP001' })
  createdBy: string;

  @ApiProperty({ example: '2024-06-21T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: 'EMP001' })
  updatedBy: string;

  @ApiProperty({ example: '2024-06-21T10:00:00.000Z' })
  updatedAt: Date;

  constructor(partial: Partial<ReportEntertainmentForm>) {
    Object.assign(this, partial);
  }
}
