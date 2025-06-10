import { ApiProperty } from '@nestjs/swagger';
import { Approval } from '../entities/approval.entity';
import { TransportationExpenseDto } from './transportation-expense.dto';
import { OtherExpenseDto } from './other-expense.dto';
import { ApprovalConditionDto } from './approval-condition.dto';
import { ApprovalBudgetDto } from './approval-budget.dto';

export class ApprovalStatusHistoryDto {
  @ApiProperty({ description: 'Status ID' })
  id: number;

  @ApiProperty({ description: 'Status value' })
  status: string;

  @ApiProperty({ description: 'User ID who updated the status' })
  userId: number;

  @ApiProperty({ description: 'When the status was updated' })
  createdAt: Date;
}

export class ApprovalDetailResponseDto implements Approval {
  @ApiProperty({ description: 'The unique identifier for the approval' })
  id: number;

  @ApiProperty({ description: 'The user ID who created the approval' })
  userId: number;

  @ApiProperty({ description: 'The increment ID' })
  incrementId: string;

  @ApiProperty({ description: 'The approval reference', required: false })
  approvalRef?: number;

  @ApiProperty({ description: 'The record type', required: false })
  recordType?: string;

  @ApiProperty({ description: 'The name' })
  name: string;

  @ApiProperty({ description: 'The employee code', required: false })
  employeeCode?: string;

  @ApiProperty({ description: 'The travel type', required: false })
  travelType?: string;

  @ApiProperty({ description: 'The international sub option', required: false })
  internationalSubOption?: string;

  @ApiProperty({ description: 'The work start date', required: false })
  workStartDate?: string;

  @ApiProperty({ description: 'The work end date', required: false })
  workEndDate?: string;

  @ApiProperty({ description: 'The start country', required: false })
  startCountry?: string;

  @ApiProperty({ description: 'The end country', required: false })
  endCountry?: string;

  @ApiProperty({ description: 'The remarks', required: false })
  remarks?: string;

  @ApiProperty({ description: 'The number of travelers', required: false })
  numTravelers?: string;

  @ApiProperty({ description: 'The document number', required: false })
  documentNo?: string;

  @ApiProperty({ description: 'The document telephone', required: false })
  documentTel?: string;

  @ApiProperty({ description: 'The document to', required: false })
  documentTo?: string;

  @ApiProperty({ description: 'The document title', required: false })
  documentTitle?: string;

  @ApiProperty({ description: 'When the approval was created' })
  createdAt: Date;

  @ApiProperty({ description: 'When the approval was last updated' })
  updatedAt: Date;

  @ApiProperty({ 
    description: 'ชั้นความลับ', 
    required: false,
    example: ['ลับมาก', 'ลับที่สุด']
  })
  confidentialityLevel?: string[];

  @ApiProperty({ 
    description: 'ความด่วน', 
    required: false,
    example: ['ด่วน', 'ด่วนมาก']
  })
  urgencyLevel?: string[];

  @ApiProperty({ description: 'กลุ่มผู้อนุมัติ', required: false, type: [String] })
  departments?: string[];

  @ApiProperty({ description: 'ถึงหน่วยงาน', required: false, type: [String] })
  degrees?: string[];

  @ApiProperty({ description: 'ผู้เห็นชอบผ่านเรื่อง', required: false })
  staff?: string;

  @ApiProperty({ description: 'ความเห็น', required: false })
  comments?: string;

  @ApiProperty({ description: 'วันที่ ผู้เห็นชอบผ่านเรื่อง', required: false })
  approvalDate?: string;

  @ApiProperty({ description: 'กลุ่มหน่วยงาน เลือกผู้อนุมัติ (ขั้นตอนสุดท้าย)', required: false, type: [String] })
  finalDepartments?: string[];

  @ApiProperty({ description: 'ถึงหน่วยงาน เลือกผู้อนุมัติ (ขั้นตอนสุดท้าย)', required: false, type: [String] })
  finalDegrees?: string[];

  @ApiProperty({ description: 'ผู้อนุมัติ (ขั้นตอนสุดท้าย)', required: false })
  finalStaff?: string;

  @ApiProperty({ description: 'วันที่ลงนาม', required: false })
  signerDate?: string;

  @ApiProperty({ description: 'เลือกแบบคำลงท้ายเอกสาร', required: false })
  documentEnding?: string;

  @ApiProperty({ description: 'คำลงท้ายเอกสาร', required: false })
  documentEndingWording?: string;

  @ApiProperty({ description: 'ผู้ลงนามในใบบันทึก', required: false })
  signerName?: string;

  @ApiProperty({ description: 'ใช้ลายเซ็นจากไฟล์แนบ', required: false })
  useFileSignature?: boolean;

  @ApiProperty({ description: 'รหัสไฟล์ลายเซ็น', required: false })
  signatureAttachmentId?: number;

  @ApiProperty({ description: 'ใช้ลายเซ็นจากระบบ E-Office', required: false })
  useSystemSignature?: boolean;

  @ApiProperty({ 
    description: 'Status history of the approval',
    type: [ApprovalStatusHistoryDto]
  })
  statusHistory: ApprovalStatusHistoryDto[];

  @ApiProperty({ description: 'Current status of the approval' })
  currentStatus: string;

  @ApiProperty({
    description: 'Transportation expenses',
    type: [TransportationExpenseDto],
    required: false
  })
  transportationExpenses?: TransportationExpenseDto[];

  @ApiProperty({
    description: 'Other expenses',
    type: [OtherExpenseDto],
    required: false
  })
  otherExpenses?: OtherExpenseDto[];

  @ApiProperty({
    description: 'Total outbound amount for form 3',
    required: false
  })
  form3TotalOutbound?: number;

  @ApiProperty({
    description: 'Total inbound amount for form 3',
    required: false
  })
  form3TotalInbound?: number;

  @ApiProperty({
    description: 'Total amount for form 3',
    required: false
  })
  form3TotalAmount?: number;

  @ApiProperty({
    description: 'Approval conditions',
    type: [ApprovalConditionDto],
    required: false
  })
  conditions?: ApprovalConditionDto[];

  @ApiProperty({
    description: 'รายการงบประมาณ',
    type: [ApprovalBudgetDto],
    required: false
  })
  budgets?: ApprovalBudgetDto[];
} 