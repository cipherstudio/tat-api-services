import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsArray,
  ValidateNested,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import {
  CreateMeetingExpenseReportFoodRowDto,
  CreateMeetingExpenseReportSnackRowDto,
} from './create-meeting-expense-report.dto';

export class UpdateMeetingExpenseReportDto {
  @ApiProperty({ example: 'IT Department' })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiProperty({ example: 'Development Team' })
  @IsOptional()
  @IsString()
  section?: string;

  @ApiProperty({ example: 'Project Alpha' })
  @IsOptional()
  @IsString()
  job?: string;

  @ApiProperty({ example: 'EMP001' })
  @IsOptional()
  @IsString()
  employeeId?: string;

  @ApiProperty({ example: 'John Doe' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'Manager' })
  @IsOptional()
  @IsString()
  position?: string;

  @ApiProperty({ example: 'การประชุมวางแผนงานประจำเดือน' })
  @IsOptional()
  @IsString()
  topic?: string;

  @ApiProperty({ example: 'ห้องประชุมใหญ่' })
  @IsOptional()
  @IsString()
  place?: string;

  @ApiProperty({ example: 'ประชุมประจำเดือน' })
  @IsOptional()
  @IsString()
  meetingType?: string;

  @ApiProperty({ example: 'ดร.สมชาย ใจดี' })
  @IsOptional()
  @IsString()
  chairman?: string;

  @ApiProperty({ example: '15 คน' })
  @IsOptional()
  @IsString()
  attendees?: string;

  @ApiProperty({ example: '2024-06-21' })
  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => {
    if (!value) return value;
    const date = new Date(value);
    if (isNaN(date.getTime())) return value;
    return date.toISOString().split('T')[0];
  })
  meetingDate?: string;

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
  @IsOptional()
  @IsString()
  updatedBy?: string;

  @ApiProperty({ type: [CreateMeetingExpenseReportFoodRowDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMeetingExpenseReportFoodRowDto)
  foodRows?: CreateMeetingExpenseReportFoodRowDto[];

  @ApiProperty({ type: [CreateMeetingExpenseReportSnackRowDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMeetingExpenseReportSnackRowDto)
  snackRows?: CreateMeetingExpenseReportSnackRowDto[];

  @ApiProperty({ example: '๖๕', description: 'เลขที่หัวเอกสาร PDF', required: false })
  @IsOptional()
  @IsString()
  pdfHeaderNumber?: string;

  @ApiProperty({ example: '๒๕๖๘', description: 'ปีที่หัวเอกสาร PDF', required: false })
  @IsOptional()
  @IsString()
  pdfHeaderYear?: string;
}
