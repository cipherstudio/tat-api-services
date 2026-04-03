import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsDateString,
  Min,
  MaxLength,
  IsBoolean,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

function toOptionalNumber(v: unknown): number | undefined {
  if (v === undefined || v === null || v === '') return undefined;
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  const n = Number(String(v).trim().replace(/,/g, ''));
  return Number.isFinite(n) ? n : undefined;
}

export class CreateCertificateExpenseDto {
  @ApiProperty({ description: 'รายละเอียดค่าใช้จ่าย' })
  @IsString()
  detail: string;

  @ApiProperty({ description: 'วันที่ค่าใช้จ่าย' })
  @IsDateString()
  expense_date: string;

  @ApiProperty({ description: 'จำนวนเงิน' })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => toOptionalNumber(value))
  @IsNumber()
  @Min(0)
  local_amount?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  currency_label?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  currency_code_en?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => toOptionalNumber(value))
  @IsNumber()
  exchange_rate?: number;

  @ApiProperty({ description: 'ลำดับการแสดงผล', required: false })
  @IsOptional()
  @IsNumber()
  display_order?: number;
}

export class CreateCertificateExchangeRateDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  country?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  currency_label?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  currency_code_en?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => toOptionalNumber(value))
  @IsNumber()
  exchange_rate?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  display_order?: number;
}

export class CreateCertificateReportDto {
  @ApiProperty({ description: 'ประเภทพนักงาน', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  employee_type?: string;

  @ApiProperty({ description: 'รหัสพนักงาน', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  employee_code?: string;

  @ApiProperty({ description: 'ชื่อพนักงาน' })
  @IsString()
  @MaxLength(255)
  employee_name: string;

  @ApiProperty({ description: 'ตำแหน่งพนักงาน', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  employee_position?: string;

  @ApiProperty({ description: 'งาน', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  job?: string;

  @ApiProperty({ description: 'ส่วนงาน', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  section?: string;

  @ApiProperty({ description: 'แผนก', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  department?: string;

  @ApiProperty({ description: 'ที่อยู่', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ description: 'เวลาออก', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  time_out?: string;

  @ApiProperty({ description: 'เวลาเข้า', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  time_in?: string;

  @ApiProperty({ description: 'จำนวนเงินรวม' })
  @IsNumber()
  @Min(0)
  total_amount: number;

  @ApiProperty({ description: 'รายการค่าใช้จ่าย', type: [CreateCertificateExpenseDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCertificateExpenseDto)
  expenses?: CreateCertificateExpenseDto[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  has_exchange_rate?: boolean;

  @ApiProperty({ type: [CreateCertificateExchangeRateDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCertificateExchangeRateDto)
  exchange_rates?: CreateCertificateExchangeRateDto[];

  // Payment order fields
  @ApiProperty({ description: 'มีเลขที่คำสั่งจ่ายที่ 1', required: false })
  @IsOptional()
  is_payment_order_number_1?: boolean;

  @ApiProperty({ description: 'เลขที่คำสั่งจ่ายที่ 1', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  payment_order_number_1?: string;

  @ApiProperty({ description: 'เป็นการจ่ายเงินซึ่งตามลักษณะไม่มีใบเสร็จรับเงินหรือไม่อาจเรียกใบเสร็จรับเงินจากผู้รับได้', required: false })
  @IsOptional()
  is_payment_without_receipt?: boolean;

  @ApiProperty({ description: 'เป็นการจ่ายเงินที่ออกใบเสร็จรับเงินไม่เป็นไปตามข้อกำหนดในระเบียบของ ททท.และได้แนบหลักฐาน การรับเงินพร้อมกับใบรับรองแทนใบเสร็จรับเงินนี้', required: false })
  @IsOptional()
  is_payment_nonstandard_receipt?: boolean;

  @ApiProperty({ description: 'มีเลขที่คำสั่งจ่ายที่ 2', required: false })
  @IsOptional()
  is_payment_order_number_2?: boolean;

  @ApiProperty({ description: 'เลขที่คำสั่งจ่ายที่ 2', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  payment_order_number_2?: string;

  @ApiProperty({ description: 'เป็นการจ่ายเงินที่มีใบเสร็จรับเงิน แต่ใบเสร็จรับเงินสูญหาย และไม่อาจนำสำเนาของใบเสร็จรับเงินดังกล่าวซึ่งผู้รับเงินรับรองสำเนาถูกต้องมาแสดงได และขอรับรองว่าไม่เคยนำต้นฉบับมาขอเบิกเงิน และหากค้นพบเอกสาร ดังกล่าวในภายหลังก็จะไม่นำมาใช้เพื่อขอเบิกเงินอีก', required: false })
  @IsOptional()
  is_payment_with_lost_receipt?: boolean;

  @ApiProperty({ description: 'เป็นการจ่ายเงินที่มีหลักฐานการจ่ายเงินอื่น แต่หลักฐานการจ่ายดังกล่าวสูญหาย และขอรับรองว่าไม่เคยนำต้นฉบับมาขอเบิกเงิน และหากค้นพบเอกสาร ดังกล่าวในภายหลังก็จะไม่นำมาใช้เพื่อขอเบิกเงินอีก', required: false })
  @IsOptional()
  is_payment_with_lost_document?: boolean;
}
