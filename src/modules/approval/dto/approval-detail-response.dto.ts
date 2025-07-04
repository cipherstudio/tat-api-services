import { ApiProperty } from '@nestjs/swagger';
import { Approval } from '../entities/approval.entity';
import { TransportationExpenseDto } from './transportation-expense.dto';
import { OtherExpenseDto } from './other-expense.dto';
import { ApprovalConditionDto } from './approval-condition.dto';
import { ApprovalBudgetDto } from './approval-budget.dto';
import { ApprovalDateRangeDto } from './approval-date-range.dto';
import { ApprovalContentDto } from './approval-content.dto';
import { ApprovalAccommodationExpenseDto } from './approval-accommodation-expense.dto';
import { ApprovalAccommodationTransportExpenseDto } from './approval-accommodation-transport-expense.dto';
import { ApprovalAccommodationHolidayExpenseDto } from './approval-accommodation-holiday-expense.dto';
import { ApprovalEntertainmentExpenseDto } from './approval-entertainment-expense.dto';
import { ApprovalClothingExpenseDto } from './approval-clothing-expense.dto';

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

export class TripDateRangeDto {
  @ApiProperty({
    description: 'วันที่เริ่มต้น',
    example: '2024-03-20'
  })
  start_date: string;

  @ApiProperty({
    description: 'วันที่สิ้นสุด',
    example: '2024-03-25'
  })
  end_date: string;
}

export class TripEntryDto {
  @ApiProperty({
    description: 'สถานที่',
    example: 'Bangkok',
    required: false
  })
  location?: string;

  @ApiProperty({
    description: 'จุดหมายปลายทาง',
    example: 'Phuket',
    required: false
  })
  destination?: string;

  @ApiProperty({
    description: 'จังหวัดใกล้เคียง',
    example: true,
    required: false
  })
  nearbyProvinces?: boolean;

  @ApiProperty({
    description: 'รายละเอียด',
    example: 'Business trip for conference',
    required: false
  })
  details?: string;

  @ApiProperty({
    description: 'ประเภทจุดหมายปลายทาง',
    example: 'domestic',
    required: false
  })
  destinationType?: string;

  @ApiProperty({
    description: 'รหัสปลายทาง',
    example: 1,
    required: false
  })
  destinationId?: number;

  @ApiProperty({
    description: 'ชื่อตารางปลายทาง',
    example: 'countries',
    required: false
  })
  destinationTable?: string;

  @ApiProperty({
    description: 'ช่วงวันที่เดินทาง',
    type: [TripDateRangeDto],
    required: false
  })
  tripDateRanges?: TripDateRangeDto[];
}

export class WorkLocationDto extends TripEntryDto {
  @ApiProperty({
    description: 'รายการค่าใช้จ่ายการเดินทาง',
    type: [TransportationExpenseDto]
  })
  transportationExpenses: TransportationExpenseDto[];

  @ApiProperty({
    description: 'รายการค่าเบี้ยเลี้ยง ค่าที่พัก ค่าขนย้ายสิ่งของ',
    type: [ApprovalAccommodationExpenseDto],
    required: false
  })
  accommodationExpenses?: ApprovalAccommodationExpenseDto[];

  @ApiProperty({
    description: 'รายการค่าพาหนะ',
    type: [ApprovalAccommodationTransportExpenseDto],
    required: false
  })
  accommodationTransportExpenses?: ApprovalAccommodationTransportExpenseDto[];

  @ApiProperty({
    description: 'รายการค่าวันหยุด',
    type: [ApprovalAccommodationHolidayExpenseDto],
    required: false
  })
  accommodationHolidayExpenses?: ApprovalAccommodationHolidayExpenseDto[];

  @ApiProperty({
    description: 'Checked status',
    example: true,
    required: false
  })
  checked?: boolean;
}

export class StaffMemberDto {
  @ApiProperty({
    description: 'รหัสพนักงาน',
    example: '66019'
  })
  employeeCode: string;

  @ApiProperty({
    description: 'ประเภทพนักงาน',
    example: 'employee'
  })
  type: string;

  @ApiProperty({
    description: 'ชื่อพนักงาน',
    example: 'John Doe'
  })
  name: string;

  @ApiProperty({
    description: 'บทบาท',
    example: 'Developer'
  })
  role: string;

  @ApiProperty({
    description: 'ตำแหน่ง',
    example: 'Senior Developer'
  })
  position: string;

  @ApiProperty({
    description: 'ระดับสิทธิ์',
    example: 'C5'
  })
  rightEquivalent: string;

  @ApiProperty({
    description: 'ตำแหน่งในองค์กร',
    example: 'IT Department'
  })
  organizationPosition: string;

  @ApiProperty({
    description: 'สถานที่ทำงาน',
    type: [WorkLocationDto]
  })
  workLocations: WorkLocationDto[];

  @ApiProperty({
    description: 'ค่ารับรองตามสิทธิ์',
    type: [ApprovalEntertainmentExpenseDto],
    required: false
  })
  entertainmentExpenses?: ApprovalEntertainmentExpenseDto[];

  @ApiProperty({
    description: 'ค่าเครื่องแต่งกาย',
    type: [ApprovalClothingExpenseDto],
    required: false
  })
  clothingExpenses?: ApprovalClothingExpenseDto[];
}

export class ApprovalTripEntryDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  trip_id: number;

  @ApiProperty()
  destination_id: number;

  @ApiProperty()
  destination_table: string;

  @ApiProperty()
  trip_date: Date;
}

export class ApprovalWorkLocationDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  work_location_id: number;

  @ApiProperty()
  destination_id: number;

  @ApiProperty()
  destination_table: string;

  @ApiProperty()
  work_location: WorkLocationDto;
}

export class ApprovalDetailResponseDto implements Approval {
  @ApiProperty({ description: 'The unique identifier for the approval' })
  id: number;

  @ApiProperty({ description: 'The user ID who created the approval' })
  userId: number;

  @ApiProperty({ description: 'The increment ID' })
  incrementId: string;

  @ApiProperty({
    description: 'Reference to another approval',
    required: false,
    example: 123
  })
  approvalRef?: number;

  @ApiProperty({
    description: 'Record type',
    required: false,
    example: 'owner'
  })
  recordType?: string;

  @ApiProperty({
    description: 'The name of the employee',
    example: 'John Doe'
  })
  name: string;

  @ApiProperty({
    description: 'Employee code',
    required: false,
    example: '66019'
  })
  employeeCode?: string;

  @ApiProperty({
    description: 'Travel type',
    required: false,
    example: 'domestic'
  })
  travelType?: string;

  @ApiProperty({
    description: 'International sub option',
    required: false,
    example: 'travel_later'
  })
  internationalSubOption?: string;

  @ApiProperty({
    description: 'Work start date',
    required: false,
    example: '2024-03-20'
  })
  workStartDate?: string;

  @ApiProperty({
    description: 'Work end date',
    required: false,
    example: '2024-03-25'
  })
  workEndDate?: string;

  @ApiProperty({
    description: 'Start country',
    required: false,
    example: 'Thailand'
  })
  startCountry?: string;

  @ApiProperty({
    description: 'End country',
    required: false,
    example: 'Japan'
  })
  endCountry?: string;

  @ApiProperty({
    description: 'Remarks',
    required: false,
    example: 'Business trip for annual meeting'
  })
  remarks?: string;

  @ApiProperty({
    description: 'Number of travelers',
    required: false,
    example: 'single'
  })
  numTravelers?: string;

  @ApiProperty({
    description: 'Document number',
    required: false,
    example: 'DOC-2024-001'
  })
  documentNo?: string;

  @ApiProperty({
    description: 'Document telephone',
    required: false,
    example: '0812345678'
  })
  documentTel?: string;

  @ApiProperty({
    description: 'Document to',
    required: false,
    example: 'HR Department'
  })
  documentTo?: string;

  @ApiProperty({
    description: 'Document title',
    required: false,
    example: 'Business Trip Request'
  })
  documentTitle?: string;

  @ApiProperty({
    description: 'Travel date ranges',
    type: [ApprovalDateRangeDto],
    required: false
  })
  travelDateRanges?: ApprovalDateRangeDto[];

  @ApiProperty({
    description: 'Approval contents',
    type: [ApprovalContentDto],
    required: false
  })
  approvalContents?: ApprovalContentDto[];

  @ApiProperty({
    description: 'รหัสไฟล์แนบ',
    required: false,
    example: 1
  })
  attachmentId?: number;

  @ApiProperty({
    description: 'Trip entries for the approval',
    type: [TripEntryDto],
    required: false
  })
  tripEntries?: TripEntryDto[];

  @ApiProperty({
    description: 'Staff members for the approval',
    type: [StaffMemberDto],
    required: false
  })
  staffMembers?: StaffMemberDto[];

  @ApiProperty({
    description: 'Other expenses',
    type: [OtherExpenseDto],
    required: false
  })
  otherExpenses?: OtherExpenseDto[];

  @ApiProperty({
    description: 'Total outbound amount for form 3',
    required: false,
    example: 1000
  })
  form3TotalOutbound?: number;

  @ApiProperty({
    description: 'Total inbound amount for form 3',
    required: false,
    example: 800
  })
  form3TotalInbound?: number;

  @ApiProperty({
    description: 'Total amount for form 3',
    required: false,
    example: 1800
  })
  form3TotalAmount?: number;

  @ApiProperty({
    description: 'เกินสิทธิ์ค่าที่พัก',
    required: false,
    example: true
  })
  exceedLodgingRightsChecked?: boolean;

  @ApiProperty({
    description: 'เหตุผลที่เกินสิทธิ์ค่าที่พัก',
    required: false,
    example: 'เนื่องจากเป็นช่วงเทศกาล'
  })
  exceedLodgingRightsReason?: string;

  @ApiProperty({
    description: 'ยอดรวมฟอร์ม 4',
    required: false,
    example: 5000
  })
  form4TotalAmount?: number;

  @ApiProperty({
    description: 'ยอดรวมฟอร์ม 5',
    required: false,
    example: 3000
  })
  form5TotalAmount?: number;

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

  @ApiProperty({
    description: 'ชั้นความลับ',
    required: false,
    example: 'ลับที่สุด',
  })
  confidentialityLevel?: string;

  @ApiProperty({
    description: 'ความด่วน',
    required: false,
    example: 'ด่วนมาก',
  })
  urgencyLevel?: string;

  @ApiProperty({
    description: 'กลุ่มผู้อนุมัติ',
    required: false,
    example: ['หน่วยงานขึ้นตรงผู้ว่า', 'รบ.ด้านบริหาร']
  })
  departments?: string[];

  @ApiProperty({
    description: 'ถึงหน่วยงาน',
    required: false,
    example: ['ททท.', 'กอง']
  })
  degrees?: string[];

  @ApiProperty({
    description: 'ผู้เห็นชอบผ่านเรื่อง',
    required: false,
    example: 'หัวหน้าส่วนสื่อดิจิทัล (นางสาวสมหญิง ไชโย)'
  })
  staff?: string;

  @ApiProperty({
    description: 'รหัสผู้เห็นชอบผ่านเรื่อง',
    required: false,
    example: '66019'
  })
  staffEmployeeCode?: string;

  @ApiProperty({
    description: 'ความเห็น',
    required: false,
    example: 'รายละเอียดความเห็น'
  })
  comments?: string;

  @ApiProperty({
    description: 'วันที่ ผู้เห็นชอบผ่านเรื่อง',
    required: false,
    example: '2024-03-20'
  })
  approvalDate?: string;

  @ApiProperty({
    description: 'กลุ่มหน่วยงาน เลือกผู้อนุมัติ (ขั้นตอนสุดท้าย)',
    required: false,
    example: ['หน่วยงานขึ้นตรงผู้ว่า', 'รบ.ด้านบริหาร']
  })
  finalDepartments?: string[];

  @ApiProperty({
    description: 'ถึงหน่วยงาน เลือกผู้อนุมัติ (ขั้นตอนสุดท้าย)',
    required: false,
    example: ['ททท.', 'กอง']
  })
  finalDegrees?: string[];

  @ApiProperty({
    description: 'ผู้อนุมัติ (ขั้นตอนสุดท้าย)',
    required: false,
    example: 'หัวหน้าส่วนสื่อดิจิทัล (นางสาวสมหญิง ไชโย)'
  })
  finalStaff?: string;

  @ApiProperty({
    description: 'รหัสผู้อนุมัติ (ขั้นตอนสุดท้าย)',
    required: false,
    example: '66019'
  })
  finalStaffEmployeeCode?: string;

  @ApiProperty({
    description: 'วันที่ลงนาม',
    required: false,
    example: '2024-03-20'
  })
  signerDate?: string;

  @ApiProperty({
    description: 'เลือกแบบคำลงท้ายเอกสาร',
    required: false,
    example: 'ขอแสดงความนับถือเป็นอย่างสูง'
  })
  documentEnding?: string;

  @ApiProperty({
    description: 'คำลงท้ายเอกสาร',
    required: false,
    example: 'ขอแสดงความนับถือเป็นอย่างสูง 123'
  })
  documentEndingWording?: string;

  @ApiProperty({
    description: 'ผู้ลงนามในใบบันทึก',
    required: false,
    example: 'นายสมชาย สมหญิง'
  })
  signerName?: string;

  @ApiProperty({
    description: 'ใช้ลายเซ็นจากไฟล์แนบ',
    required: false,
    example: false
  })
  useFileSignature?: boolean;

  @ApiProperty({
    description: 'รหัสไฟล์ลายเซ็น',
    required: false,
    example: 1
  })
  signatureAttachmentId?: number;

  @ApiProperty({
    description: 'ใช้ลายเซ็นจากระบบ E-Office',
    required: false,
    example: false
  })
  useSystemSignature?: boolean;

  @ApiProperty({ description: 'When the approval was created' })
  createdAt: Date;

  @ApiProperty({ description: 'When the approval was last updated' })
  updatedAt: Date;

  @ApiProperty({ 
    description: 'Status history of the approval',
    type: [ApprovalStatusHistoryDto]
  })
  statusHistory: ApprovalStatusHistoryDto[];

  @ApiProperty({ description: 'Current status of the approval' })
  currentStatus: string;

  @ApiProperty({ description: 'Continuous approval' })
  continuousApproval: {
    id: number;
    employeeCode: string;
    signerName: string;
    signerDate: string;
    documentEnding: string;
    documentEndingWording: string;
    useFileSignature: boolean;
    signatureAttachmentId: number;
    useSystemSignature: boolean;
    comments: string;
    statusCode: string;
    statusLabel: string;
  }[];
} 