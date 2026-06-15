import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsString, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class ApprovalClothingExpenseQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  order_by?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  direction?: 'asc' | 'desc';

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  clothing_file_checked?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  clothing_amount?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  clothing_reason?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  reporting_date?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  next_claim_date?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  work_start_date?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  work_end_date?: string;

  // @ApiProperty({ required: false })
  // @IsOptional()
  // @IsNumber()
  // approval_accommodation_expense_id?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  staff_member_id?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  approval_id?: number;

  @ApiProperty({ required: false, description: 'Employee code (VARCHAR2 in DB; must bind as string for Oracle)' })
  @IsOptional()
  @IsString()
  employee_code?: string;

  @ApiProperty({
    required: false,
    description: 'กรองตามผู้สร้างใบอนุมัติ (created_employee_code / employee_code / continuous_employee_code)',
  })
  @IsOptional()
  @IsString()
  requestor_employee_code?: string;

  @ApiProperty({
    required: false,
    description: 'true = กรองเฉพาะ ace.employee_code (ใช้คู่กับ employee_code สำหรับประวัติส่วนตัว)',
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  beneficiary_only?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  increment_id?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  destination_country?: string;

  @ApiProperty({
    required: false,
    description: 'กรองตามวันที่ขออนุมัติ (approval.approval_date) รูปแบบ YYYY-MM-DD',
  })
  @IsOptional()
  @IsString()
  approval_request_date?: string;

  @ApiProperty({
    required: false,
    description:
      'กรองสถานะเกินกำหนด: true = work_start_date เลยวันนี้แล้ว และใบอนุมัติ approval_status_label_id = 3; false = ยังไม่ถึงวันเริ่มงานหรือไม่ระบุวันเริ่มงาน (ไม่บังคับ status label); ไม่ส่ง = ทั้งหมด',
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  is_overdue?: boolean;

  @ApiProperty({
    required: false,
    description: 'true = รวมรายการที่ยกเลิกสำเร็จแล้ว (is_cancelled=true) ด้วย ค่า default คือ false (ซ่อน)',
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  include_cancelled?: boolean;
}
