import { ApiProperty } from '@nestjs/swagger';

export class ReportCertificateExpense {
  @ApiProperty({ description: 'รหัสค่าใช้จ่าย' })
  id: number;

  @ApiProperty({ description: 'รหัสใบรับรอง' })
  report_certificate_id: number;

  @ApiProperty({ description: 'รายละเอียดค่าใช้จ่าย' })
  detail: string;

  @ApiProperty({ description: 'วันที่ค่าใช้จ่าย' })
  expense_date: Date;

  @ApiProperty({ description: 'จำนวนเงิน' })
  amount: number;

  @ApiProperty({ description: 'ลำดับการแสดงผล' })
  display_order: number;

  @ApiProperty({ description: 'สร้างเมื่อ' })
  created_at: Date;

  @ApiProperty({ description: 'แก้ไขเมื่อ' })
  updated_at: Date;
}

