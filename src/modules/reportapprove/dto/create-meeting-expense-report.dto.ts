import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CreateMeetingExpenseReportFoodRowDto {
  @ApiProperty({ example: 'morning', enum: ['morning', 'lunch', 'dinner'] })
  @IsNotEmpty()
  @IsEnum(['morning', 'lunch', 'dinner'])
  mealType: string;

  @ApiProperty({ example: 'เช้า' })
  @IsNotEmpty()
  @IsString()
  mealName: string;

  @ApiProperty({ example: true })
  @IsOptional()
  checked?: boolean;

  @ApiProperty({ example: 150.0 })
  @IsOptional()
  @IsNumber()
  rate?: number;

  @ApiProperty({ example: 1500.0 })
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiProperty({ example: 'R001' })
  @IsOptional()
  @IsString()
  receipt?: string;

  @ApiProperty({ example: '2024-06-21' })
  @IsOptional()
  @IsDateString()
  receiptDate?: string;
}

export class CreateMeetingExpenseReportSnackRowDto {
  @ApiProperty({ example: 'morning', enum: ['morning', 'afternoon'] })
  @IsNotEmpty()
  @IsEnum(['morning', 'afternoon'])
  snackType: string;

  @ApiProperty({ example: 'เช้า' })
  @IsNotEmpty()
  @IsString()
  snackName: string;

  @ApiProperty({ example: true })
  @IsOptional()
  checked?: boolean;

  @ApiProperty({ example: 80.0 })
  @IsOptional()
  @IsNumber()
  rate?: number;

  @ApiProperty({ example: 800.0 })
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiProperty({ example: 'R001' })
  @IsOptional()
  @IsString()
  receipt?: string;

  @ApiProperty({ example: '2024-06-21' })
  @IsOptional()
  @IsDateString()
  receiptDate?: string;
}

export class CreateMeetingExpenseReportDto {
  @ApiProperty({ example: 'IT Department' })
  @IsNotEmpty()
  @IsString()
  department: string;

  @ApiProperty({ example: 'Development Team' })
  @IsNotEmpty()
  @IsString()
  section: string;

  @ApiProperty({ example: 'Project Alpha' })
  @IsNotEmpty()
  @IsString()
  job: string;

  @ApiProperty({ example: 'EMP001' })
  @IsNotEmpty()
  @IsString()
  employeeId: string;

  @ApiProperty({ example: 'John Doe' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'Manager' })
  @IsNotEmpty()
  @IsString()
  position: string;

  @ApiProperty({ example: 'การประชุมวางแผนงานประจำเดือน' })
  @IsNotEmpty()
  @IsString()
  topic: string;

  @ApiProperty({ example: 'ห้องประชุมใหญ่' })
  @IsNotEmpty()
  @IsString()
  place: string;

  @ApiProperty({ example: 'ประชุมประจำเดือน' })
  @IsNotEmpty()
  @IsString()
  meetingType: string;

  @ApiProperty({ example: 'ดร.สมชาย ใจดี' })
  @IsOptional()
  @IsString()
  chairman?: string;

  @ApiProperty({ example: '15 คน' })
  @IsNotEmpty()
  @IsString()
  attendees: string;

  @ApiProperty({ example: '2024-06-21' })
  @IsNotEmpty()
  @IsDateString()
  @Transform(({ value }) => {
    if (!value) return value;
    const date = new Date(value);
    if (isNaN(date.getTime())) return value;
    return date.toISOString().split('T')[0];
  })
  meetingDate: string;

  @ApiProperty({ example: 5000.0 })
  @IsOptional()
  @IsNumber()
  totalAmount?: number;

  @ApiProperty({
    example: 'draft',
    enum: ['draft', 'pending', 'approved', 'rejected'],
  })
  @IsOptional()
  @IsEnum(['draft', 'pending', 'approved', 'rejected'])
  status?: string;

  @ApiProperty({ example: 'รอการอนุมัติ' })
  @IsOptional()
  @IsString()
  statusDescription?: string;

  @ApiProperty({ example: 'EMP001' })
  @IsNotEmpty()
  @IsString()
  createdBy: string;

  @ApiProperty({ type: [CreateMeetingExpenseReportFoodRowDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMeetingExpenseReportFoodRowDto)
  foodRows: CreateMeetingExpenseReportFoodRowDto[];

  @ApiProperty({ type: [CreateMeetingExpenseReportSnackRowDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMeetingExpenseReportSnackRowDto)
  snackRows: CreateMeetingExpenseReportSnackRowDto[];
}
