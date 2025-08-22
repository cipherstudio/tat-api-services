import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { CommonQueryDto } from '@common/dto/common-query.dtp';

export class CertificateReportQueryDto extends CommonQueryDto {
  @ApiProperty({ description: 'ประเภทพนักงาน', required: false })
  @IsOptional()
  @IsString()
  employee_type?: string;

  @ApiProperty({ description: 'รหัสพนักงาน', required: false })
  @IsOptional()
  @IsString()
  employee_code?: string;

  @ApiProperty({ description: 'ชื่อพนักงาน', required: false })
  @IsOptional()
  @IsString()
  employee_name?: string;

  @ApiProperty({ description: 'ตำแหน่งพนักงาน', required: false })
  @IsOptional()
  @IsString()
  employee_position?: string;

  @ApiProperty({ description: 'แผนก', required: false })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiProperty({ description: 'จำนวนเงินรวมขั้นต่ำ', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  min_amount?: number;

  @ApiProperty({ description: 'จำนวนเงินรวมสูงสุด', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  max_amount?: number;

  @ApiProperty({ description: 'วันที่สร้างตั้งแต่', required: false })
  @IsOptional()
  @IsDateString()
  created_at_from?: string;

  @ApiProperty({ description: 'วันที่สร้างถึง', required: false })
  @IsOptional()
  @IsDateString()
  created_at_to?: string;

  // Time filters
  @ApiProperty({ description: 'เวลาออกตั้งแต่', required: false })
  @IsOptional()
  @IsString()
  time_out_from?: string;

  @ApiProperty({ description: 'เวลาออกถึง', required: false })
  @IsOptional()
  @IsString()
  time_out_to?: string;

  @ApiProperty({ description: 'เวลาเข้าตั้งแต่', required: false })
  @IsOptional()
  @IsString()
  time_in_from?: string;

  @ApiProperty({ description: 'เวลาเข้าถึง', required: false })
  @IsOptional()
  @IsString()
  time_in_to?: string;

  @ApiProperty({ description: 'Sort by field', required: false })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiProperty({ description: 'Sort order', required: false, enum: ['asc', 'desc'] })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';

  // Payment order filters
  @ApiProperty({ description: 'มีเลขที่คำสั่งจ่ายที่ 1', required: false })
  @IsOptional()
  is_payment_order_number_1?: boolean;

  @ApiProperty({ description: 'มีเลขที่คำสั่งจ่ายที่ 2', required: false })
  @IsOptional()
  is_payment_order_number_2?: boolean;

  @ApiProperty({ description: 'เป็นการจ่ายเงินซึ่งตามลักษณะไม่มีใบเสร็จรับเงิน', required: false })
  @IsOptional()
  is_payment_without_receipt?: boolean;

  @ApiProperty({ description: 'เป็นการจ่ายเงินที่ออกใบเสร็จรับเงินไม่เป็นไปตามข้อกำหนด', required: false })
  @IsOptional()
  is_payment_nonstandard_receipt?: boolean;

  @ApiProperty({ description: 'เป็นการจ่ายเงินที่มีใบเสร็จรับเงินสูญหาย', required: false })
  @IsOptional()
  is_payment_with_lost_receipt?: boolean;

  @ApiProperty({ description: 'เป็นการจ่ายเงินที่มีหลักฐานการจ่ายเงินสูญหาย', required: false })
  @IsOptional()
  is_payment_with_lost_document?: boolean;

  @ApiProperty({ description: 'ค้นหาในรายละเอียดค่าใช้จ่าย', required: false })
  @IsOptional()
  @IsString()
  expense_details_search?: string;
}
