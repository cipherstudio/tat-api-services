import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  ValidateNested,
  IsEnum,
  IsBoolean,
  IsDateString,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ApprovalDateRangeDto } from './approval-date-range.dto';
import { ApprovalContentDto } from './approval-content.dto';
import { TransportationExpenseDto } from './transportation-expense.dto';
import { OtherExpenseDto } from './other-expense.dto';
import { ApprovalConditionDto } from './approval-condition.dto';
import { ApprovalBudgetDto } from './approval-budget.dto';
import { ApprovalAccommodationExpenseDto } from './approval-accommodation-expense.dto';
import { CreateAttachmentDto } from './approval-attachment.dto';
import { ApprovalAccommodationTransportExpenseDto } from './approval-accommodation-transport-expense.dto';
import { ApprovalAccommodationHolidayExpenseDto } from './approval-accommodation-holiday-expense.dto';
import { ApprovalEntertainmentExpenseDto } from './approval-entertainment-expense.dto';
import { ApprovalClothingExpenseDto } from './approval-clothing-expense.dto';

/**
 * DTO for updating a approval
 * @TypeProperty({
 *   category: 'dto',
 *   description: 'DTO for updating a approval',
 *   extends: ['CreateApprovalDto']
 * })
 */
export class TripDateRangeDto {
  @ApiProperty({
    description: 'วันที่เริ่มต้น',
    example: '2024-03-20',
  })
  @IsDateString()
  start_date: string;

  @ApiProperty({
    description: 'วันที่สิ้นสุด',
    example: '2024-03-25',
  })
  @IsDateString()
  end_date: string;
}

export class TripEntryDto {
  @ApiProperty({
    description: 'สถานที่',
    example: 'Bangkok',
    required: false,
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({
    description: 'จุดหมายปลายทาง',
    example: 'Phuket',
    required: false,
  })
  @IsOptional()
  @IsString()
  destination?: string;

  @ApiProperty({
    description: 'จังหวัดใกล้เคียง',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  nearbyProvinces?: boolean;

  @ApiProperty({
    description: 'รายละเอียด',
    example: 'Business trip for conference',
    required: false,
  })
  @IsOptional()
  @IsString()
  details?: string;

  @ApiProperty({
    description: 'ประเภทจุดหมายปลายทาง',
    example: 'domestic',
    required: false,
  })
  @IsOptional()
  @IsString()
  destinationType?: string;

  @ApiProperty({
    description: 'รหัสปลายทาง',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  destinationId?: number;

  @ApiProperty({
    description: 'ชื่อตารางปลายทาง',
    example: 'countries',
    required: false,
  })
  @IsOptional()
  @IsString()
  destinationTable?: string;

  @ApiProperty({
    description: 'ช่วงวันที่เดินทาง',
    type: [TripDateRangeDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TripDateRangeDto)
  tripDateRanges?: TripDateRangeDto[];
}

export class WorkLocationDto extends TripEntryDto {
  @ApiProperty({
    description: 'รายการค่าใช้จ่ายการเดินทาง',
    type: [TransportationExpenseDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TransportationExpenseDto)
  transportationExpenses: TransportationExpenseDto[];

  @ApiProperty({
    description: 'รายการค่าเบี้ยเลี้ยง ค่าที่พัก ค่าขนย้ายสิ่งของ',
    type: [ApprovalAccommodationExpenseDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApprovalAccommodationExpenseDto)
  accommodationExpenses?: ApprovalAccommodationExpenseDto[];

  @ApiProperty({
    description: 'รายการค่าพาหนะ',
    type: [ApprovalAccommodationTransportExpenseDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApprovalAccommodationTransportExpenseDto)
  accommodationTransportExpenses?: ApprovalAccommodationTransportExpenseDto[];

  @ApiProperty({
    description: 'รายการค่าวันหยุด',
    type: [ApprovalAccommodationHolidayExpenseDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApprovalAccommodationHolidayExpenseDto)
  accommodationHolidayExpenses?: ApprovalAccommodationHolidayExpenseDto[];

  @ApiProperty({
    description: 'Checked status',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  checked?: boolean;
}

export class StaffMemberDto {
  @ApiProperty({
    description: 'รหัสพนักงาน',
    example: '66019',
  })
  @IsString()
  employeeCode: string;

  @ApiProperty({
    description: 'ประเภทพนักงาน',
    example: 'employee',
  })
  @IsString()
  type: string;

  @ApiProperty({
    description: 'ชื่อพนักงาน',
    example: 'John Doe',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'บทบาท',
    example: 'Developer',
  })
  @IsString()
  role: string;

  @ApiProperty({
    description: 'ตำแหน่ง',
    example: 'Senior Developer',
  })
  @IsString()
  position: string;

  @ApiProperty({
    description: 'ระดับสิทธิ์',
    example: 'C5',
  })
  @IsString()
  rightEquivalent: string;

  @ApiProperty({
    description: 'ตำแหน่งในองค์กร',
    example: 'IT Department',
  })
  @IsString()
  organizationPosition: string;

  @ApiProperty({
    description: 'สถานที่ทำงาน',
    type: [WorkLocationDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkLocationDto)
  workLocations: WorkLocationDto[];

  @ApiProperty({
    description: 'ค่ารับรองตามสิทธิ์',
    type: [ApprovalEntertainmentExpenseDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApprovalEntertainmentExpenseDto)
  entertainmentExpenses?: ApprovalEntertainmentExpenseDto[];

  @ApiProperty({
    description: 'ค่าเครื่องแต่งกาย',
    type: [ApprovalClothingExpenseDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApprovalClothingExpenseDto)
  clothingExpenses?: ApprovalClothingExpenseDto[];
}

export class UpdateApprovalDto {
  @ApiProperty({
    description: 'Reference to another approval',
    required: false,
    example: 123,
  })
  @IsOptional()
  @IsNumber()
  approvalRef?: number;

  @ApiProperty({
    description: 'Record type',
    required: false,
    example: 'owner',
  })
  @IsOptional()
  @IsString()
  recordType?: string;

  @ApiProperty({
    description: 'The name of the employee',
    required: false,
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Employee code',
    required: false,
    example: '66019',
  })
  @IsOptional()
  @IsString()
  employeeCode?: string;

  @ApiProperty({
    description: 'Travel type',
    required: false,
    example: 'domestic',
  })
  @IsOptional()
  @IsString()
  travelType?: string;

  @ApiProperty({
    description: 'International sub option',
    required: false,
    example: 'travel_later',
  })
  @IsOptional()
  @IsString()
  internationalSubOption?: string;

  @ApiProperty({
    description: 'Work start date',
    required: false,
    example: '2024-03-20',
  })
  @IsOptional()
  @IsString()
  workStartDate?: string;

  @ApiProperty({
    description: 'Work end date',
    required: false,
    example: '2024-03-25',
  })
  @IsOptional()
  @IsString()
  workEndDate?: string;

  @ApiProperty({
    description: 'Start country',
    required: false,
    example: 'Thailand',
  })
  @IsOptional()
  @IsString()
  startCountry?: string;

  @ApiProperty({
    description: 'End country',
    required: false,
    example: 'Japan',
  })
  @IsOptional()
  @IsString()
  endCountry?: string;

  @ApiProperty({
    description: 'Remarks',
    required: false,
    example: 'Business trip for annual meeting',
  })
  @IsOptional()
  @IsString()
  remarks?: string;

  @ApiProperty({
    description: 'Number of travelers',
    required: false,
    example: 'single',
  })
  @IsOptional()
  @IsString()
  numTravelers?: string;

  @ApiProperty({
    description: 'Document number',
    required: false,
    example: 'DOC-2024-001',
  })
  @IsOptional()
  @IsString()
  documentNo?: string;

  @ApiProperty({
    description: 'Document number (เลขอ้างอิงงาน)',
    required: false,
    example: 'เลขอ้างอิงงาน 456/2567',
  })
  @IsOptional()
  @IsString()
  documentNumber?: string;

  @ApiProperty({
    description: 'Document telephone',
    required: false,
    example: '0812345678',
  })
  @IsOptional()
  @IsString()
  documentTel?: string;

  @ApiProperty({
    description: 'Document to',
    required: false,
    example: 'HR Department',
  })
  @IsOptional()
  @IsString()
  documentTo?: string;

  @ApiProperty({
    description: 'Document title',
    required: false,
    example: 'Business Trip Request',
  })
  @IsOptional()
  @IsString()
  documentTitle?: string;

  @ApiProperty({
    description: 'Travel date ranges',
    type: [ApprovalDateRangeDto],
    required: false,
    example: [
      {
        start_date: '2024-03-20',
        end_date: '2024-03-25',
      },
      {
        start_date: '2024-04-01',
        end_date: '2024-04-05',
      },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApprovalDateRangeDto)
  travelDateRanges?: ApprovalDateRangeDto[];

  @ApiProperty({
    description: 'Approval contents',
    type: [ApprovalContentDto],
    required: false,
    example: [
      {
        detail: 'Meeting with client in Tokyo office',
      },
      {
        detail: 'Visit manufacturing plant in Osaka',
      },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApprovalContentDto)
  approvalContents?: ApprovalContentDto[];

  @ApiProperty({
    description: 'รหัสไฟล์แนบ',
    required: false,
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  attachmentId?: number;

  @ApiProperty({
    description: 'ไฟล์เอกสารแนบ',
    type: [CreateAttachmentDto],
    required: false,
    example: [
      { fileId: 124 },
      { fileId: 125 }
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAttachmentDto)
  documentAttachments?: CreateAttachmentDto[];

  @ApiProperty({
    description: 'ไฟล์ลายเซ็นแนบ',
    type: [CreateAttachmentDto],
    required: false,
    example: [
      { fileId: 126 }
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAttachmentDto)
  signatureAttachments?: CreateAttachmentDto[];

  @ApiProperty({
    description: 'Trip entries for the approval',
    type: [TripEntryDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TripEntryDto)
  tripEntries?: TripEntryDto[];

  @ApiProperty({
    description: 'Staff members for the approval',
    type: [StaffMemberDto],
    required: false,
    example: [
      {
        employeeCode: '66019',
        type: 'employee',
        name: 'John Doe',
        role: 'Developer',
        position: 'Senior Developer',
        rightEquivalent: 'C5',
        organizationPosition: 'IT Department',
        workLocations: [
          {
            location: 'Bangkok',
            destination: 'Phuket',
            nearbyProvinces: true,
            details: 'Business trip for conference',
            checked: true,
            destinationType: 'domestic',
            destinationId: 1,
            destinationTable: 'countries',
            tripDateRanges: [
              {
                start_date: '2024-03-20',
                end_date: '2024-03-25',
              },
            ],
            transportationExpenses: [
              {
                travelType: 'roundtrip',
                expenseType: 'bangkok_to_bangkok',
                travelMethod: 'both',
                outbound: {
                  origin: 'Bangkok',
                  destination: 'Chiang Mai',
                  trips: 2,
                  expense: 500,
                  total: 1000,
                },
                inbound: {
                  origin: 'Chiang Mai',
                  destination: 'Bangkok',
                  trips: 2,
                  expense: 400,
                  total: 800,
                },
                totalAmount: 1800,
              },
            ],
            accommodationExpenses: [
              {
                totalAmount: 5000,
                hasMealOut: true,
                hasMealIn: true,
                mealOutAmount: 200,
                mealInAmount: 150,
                mealOutCount: 2,
                mealInCount: 1,
                allowanceOutChecked: true,
                allowanceOutRate: 300,
                allowanceOutDays: 3,
                allowanceOutTotal: 900,
                allowanceInChecked: true,
                allowanceInRate: 200,
                allowanceInDays: 2,
                allowanceInTotal: 400,
                lodgingFixedChecked: false,
                lodgingDoubleChecked: true,
                lodgingSingleChecked: false,
                lodgingNights: 3,
                lodgingRate: 1000,
                lodgingDoubleNights: 3,
                lodgingDoubleRate: 800,
                lodgingSingleNights: 0,
                lodgingSingleRate: 0,
                lodgingDoublePerson: 'John Smith',
                lodgingDoublePersonExternal: 'Jane Smith',
                lodgingTotal: 2400,
                movingCostChecked: true,
                movingCostRate: 300,
              },
            ],
            accommodationTransportExpenses: [
              {
                type: 'flight',
                amount: 5000,
                checked: true,
                flightRoute: 'BKK-PHUKET',
              },
            ],
            accommodationHolidayExpenses: [
              {
                date: '2024-03-20',
                thaiDate: 'วันอังคารที่ 3 มิถุนายน พ.ศ. 2568',
                checked: true,
                time: 'full',
                hours: '1',
                total: 750,
                note: 'Public holiday',
              },
            ],
          },
        ],
        entertainmentExpenses: [
          {
            entertainmentShortChecked: true,
            entertainmentLongChecked: false,
            entertainmentAmount: 1000,
          },
        ],
        clothingExpenses: [
          {
            clothingFileChecked: true,
            clothingAmount: 1000,
            clothingReason: 'Business trip',
            attachmentId: 1,
            // "reportingDate": "2024-03-20",
            // "nextClaimDate": "2024-03-25",
            // "workEndDate": "2024-03-25"
          },
        ],
      },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StaffMemberDto)
  staffMembers?: StaffMemberDto[];

  @ApiProperty({
    description: 'Other expenses',
    type: [OtherExpenseDto],
    required: false,
    example: [
      {
        type: 'meeting',
        amount: 5000,
        position: 'Manager',
        reason: 'Monthly team meeting',
        acknowledged: true,
      },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OtherExpenseDto)
  otherExpenses?: OtherExpenseDto[];

  @ApiProperty({
    description: 'Total outbound amount for form 3',
    required: false,
    example: 1000,
  })
  @IsOptional()
  @IsNumber()
  form3TotalOutbound?: number;

  @ApiProperty({
    description: 'Total inbound amount for form 3',
    required: false,
    example: 800,
  })
  @IsOptional()
  @IsNumber()
  form3TotalInbound?: number;

  @ApiProperty({
    description: 'Total amount for form 3',
    required: false,
    example: 1800,
  })
  @IsOptional()
  @IsNumber()
  form3TotalAmount?: number;

  @ApiProperty({
    description: 'เกินสิทธิ์ค่าที่พัก',
    required: false,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  exceedLodgingRightsChecked?: boolean;

  @ApiProperty({
    description: 'เหตุผลที่เกินสิทธิ์ค่าที่พัก',
    required: false,
    example: 'เนื่องจากเป็นช่วงเทศกาล',
  })
  @IsOptional()
  @IsString()
  exceedLodgingRightsReason?: string;

  @ApiProperty({
    description: 'ยอดรวมฟอร์ม 4',
    required: false,
    example: 5000,
  })
  @IsOptional()
  @IsNumber()
  form4TotalAmount?: number;

  @ApiProperty({
    description: 'ยอดรวมฟอร์ม 5',
    required: false,
    example: 3000,
  })
  @IsOptional()
  @IsNumber()
  form5TotalAmount?: number;

  @ApiProperty({
    description: 'Approval conditions',
    type: [ApprovalConditionDto],
    required: false,
    example: [
      {
        text: 'ต้องส่งรายงานการเดินทางภายใน 7 วัน',
      },
      {
        text: 'ต้องแจ้งการเปลี่ยนแปลงแผนการเดินทางล่วงหน้า 24 ชั่วโมง',
      },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApprovalConditionDto)
  conditions?: ApprovalConditionDto[];

  @ApiProperty({
    description: 'รายการงบประมาณ',
    type: [ApprovalBudgetDto],
    required: false,
    example: [
      {
        budget_type: 'งบประมาณรายจ่ายประจำปี',
        item_type: 'ค่าอุปกรณ์',
        reservation_code: 'RES001',
        department: 'แผนกเทคโนโลยีสารสนเทศ',
        budget_code: 'BUD001',
        attachment_id: 1,
      },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApprovalBudgetDto)
  budgets?: ApprovalBudgetDto[];

  @ApiProperty({
    description: 'ชั้นความลับ',
    required: false,
    example: 'ลับที่สุด',
  })
  @IsOptional()
  @IsString()
  confidentialityLevel?: string;

  @ApiProperty({
    description: 'ความด่วน',
    required: false,
    example: 'ด่วนมาก',
  })
  @IsOptional()
  @IsString()
  urgencyLevel?: string;

  @ApiProperty({
    description: 'กลุ่มผู้อนุมัติ',
    required: false,
    example: ['หน่วยงานขึ้นตรงผู้ว่า', 'รบ.ด้านบริหาร'],
  })
  @IsOptional()
  @IsArray()
  departments?: string[];

  @ApiProperty({
    description: 'ถึงหน่วยงาน',
    required: false,
    example: ['ททท.', 'กอง'],
  })
  @IsOptional()
  @IsArray()
  degrees?: string[];

  @ApiProperty({
    description: 'ผู้เห็นชอบผ่านเรื่อง',
    required: false,
    example: 'หัวหน้าส่วนสื่อดิจิทัล (นางสาวสมหญิง ไชโย)',
  })
  @IsOptional()
  @IsString()
  staff?: string;

  @ApiProperty({
    description: 'รหัสผู้เห็นชอบผ่านเรื่อง',
    required: false,
    example: '66019'
  })
  @IsOptional()
  @IsString()
  staffEmployeeCode?: string;

  @ApiProperty({
    description: 'ความเห็น',
    required: false,
    example: 'รายละเอียดความเห็น',
  })
  @IsOptional()
  @IsString()
  comments?: string;

  @ApiProperty({
    description: 'วันที่ ผู้เห็นชอบผ่านเรื่อง',
    required: false,
    example: '2024-03-20',
  })
  @IsOptional()
  @IsString()
  approvalDate?: string;

  @ApiProperty({
    description: 'กลุ่มหน่วยงาน เลือกผู้อนุมัติ (ขั้นตอนสุดท้าย)',
    required: false,
    example: ['หน่วยงานขึ้นตรงผู้ว่า', 'รบ.ด้านบริหาร'],
  })
  @IsOptional()
  @IsArray()
  finalDepartments?: string[];

  @ApiProperty({
    description: 'ถึงหน่วยงาน เลือกผู้อนุมัติ (ขั้นตอนสุดท้าย)',
    required: false,
    example: ['ททท.', 'กอง'],
  })
  @IsOptional()
  @IsArray()
  finalDegrees?: string[];

  @ApiProperty({
    description: 'ผู้อนุมัติ (ขั้นตอนสุดท้าย)',
    required: false,
    example: 'หัวหน้าส่วนสื่อดิจิทัล (นางสาวสมหญิง ไชโย)',
  })
  @IsOptional()
  @IsString()
  finalStaff?: string;

  @ApiProperty({
    description: 'รหัสผู้อนุมัติ (ขั้นตอนสุดท้าย)',
    required: false,
    example: '66019'
  })
  @IsOptional()
  @IsString()
  finalStaffEmployeeCode?: string;

  @ApiProperty({
    description: 'วันที่ลงนาม',
    required: false,
    example: '2024-03-20',
  })
  @IsOptional()
  @IsString()
  signerDate?: string;

  @ApiProperty({
    description: 'เลือกแบบคำลงท้ายเอกสาร',
    required: false,
    example: 'ขอแสดงความนับถือเป็นอย่างสูง',
  })
  @IsOptional()
  @IsString()
  documentEnding?: string;

  @ApiProperty({
    description: 'คำลงท้ายเอกสาร',
    required: false,
    example: 'ขอแสดงความนับถือเป็นอย่างสูง 123',
  })
  @IsOptional()
  @IsString()
  documentEndingWording?: string;

  @ApiProperty({
    description: 'ผู้ลงนามในใบบันทึก',
    required: false,
    example: 'นายสมชาย สมหญิง',
  })
  @IsOptional()
  @IsString()
  signerName?: string;

  @ApiProperty({
    description: 'ใช้ลายเซ็นจากไฟล์แนบ',
    required: false,
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  useFileSignature?: boolean;

  @ApiProperty({
    description: 'รหัสไฟล์ลายเซ็น',
    required: false,
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  signatureAttachmentId?: number;

  @ApiProperty({
    description: 'ใช้ลายเซ็นจากระบบ E-Office',
    required: false,
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  useSystemSignature?: boolean;
}
