import { ApiProperty } from '@nestjs/swagger';

export class ReportCertificate {
  @ApiProperty({ description: 'รหัสใบรับรอง' })
  id: number;

  @ApiProperty({ description: 'ประเภทพนักงาน' })
  employee_type: string;

  @ApiProperty({ description: 'รหัสพนักงาน' })
  employee_code: string;

  @ApiProperty({ description: 'ชื่อพนักงาน' })
  employee_name: string;

  @ApiProperty({ description: 'ตำแหน่งพนักงาน' })
  employee_position: string;

  @ApiProperty({ description: 'งาน' })
  job: string;

  @ApiProperty({ description: 'ส่วนงาน' })
  section: string;

  @ApiProperty({ description: 'แผนก' })
  department: string;

  @ApiProperty({ description: 'ที่อยู่' })
  address: string;

  @ApiProperty({ description: 'เวลาออก' })
  time_out: string;

  @ApiProperty({ description: 'เวลาเข้า' })
  time_in: string;

  @ApiProperty({ description: 'จำนวนเงินรวม' })
  total_amount: number;

  @ApiProperty({ description: 'สร้างโดย' })
  created_by: string;

  @ApiProperty({ description: 'สร้างเมื่อ' })
  created_at: Date;

  @ApiProperty({ description: 'แก้ไขโดย' })
  updated_by: string;

  @ApiProperty({ description: 'แก้ไขเมื่อ' })
  updated_at: Date;

  @ApiProperty({ description: 'ลบเมื่อ', required: false })
  deleted_at?: Date;

  // Payment order fields
  @ApiProperty({ description: 'มีเลขที่คำสั่งจ่ายที่ 1', required: false })
  is_payment_order_number_1?: boolean;

  @ApiProperty({ description: 'เลขที่คำสั่งจ่ายที่ 1', required: false })
  payment_order_number_1?: string;

  @ApiProperty({ description: 'เป็นการจ่ายเงินซึ่งตามลักษณะไม่มีใบเสร็จรับเงินหรือไม่อาจเรียกใบเสร็จรับเงินจากผู้รับได้', required: false })
  is_payment_without_receipt?: boolean;

  @ApiProperty({ description: 'เป็นการจ่ายเงินที่ออกใบเสร็จรับเงินไม่เป็นไปตามข้อกำหนดในระเบียบของ ททท.และได้แนบหลักฐาน การรับเงินพร้อมกับใบรับรองแทนใบเสร็จรับเงินนี้', required: false })
  is_payment_nonstandard_receipt?: boolean;

  @ApiProperty({ description: 'มีเลขที่คำสั่งจ่ายที่ 2', required: false })
  is_payment_order_number_2?: boolean;

  @ApiProperty({ description: 'เลขที่คำสั่งจ่ายที่ 2', required: false })
  payment_order_number_2?: string;

  @ApiProperty({ description: 'เป็นการจ่ายเงินที่มีใบเสร็จรับเงิน แต่ใบเสร็จรับเงินสูญหาย และไม่อาจนำสำเนาของใบเสร็จรับเงินดังกล่าวซึ่งผู้รับเงินรับรองสำเนาถูกต้องมาแสดงได และขอรับรองว่าไม่เคยนำต้นฉบับมาขอเบิกเงิน และหากค้นพบเอกสาร ดังกล่าวในภายหลังก็จะไม่นำมาใช้เพื่อขอเบิกเงินอีก', required: false })
  is_payment_with_lost_receipt?: boolean;

  @ApiProperty({ description: 'เป็นการจ่ายเงินที่มีหลักฐานการจ่ายเงินอื่น แต่หลักฐานการจ่ายดังกล่าวสูญหาย และขอรับรองว่าไม่เคยนำต้นฉบับมาขอเบิกเงิน และหากค้นพบเอกสาร ดังกล่าวในภายหลังก็จะไม่นำมาใช้เพื่อขอเบิกเงินอีก', required: false })
  is_payment_with_lost_document?: boolean;

  @ApiProperty({ description: 'รายละเอียดค่าใช้จ่ายรวม', required: false })
  expense_details?: string;
}

