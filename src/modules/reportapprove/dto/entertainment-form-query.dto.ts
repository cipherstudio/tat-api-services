import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';

export enum EntertainmentFormStatus {
  DRAFT = 1,
  PENDING = 2,
  APPROVED = 3,
  REJECTED = 4,
  CANCELLED = 5,
}

export class EntertainmentFormQueryDto {
  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  page?: number = 1;

  @ApiProperty({ example: 10, required: false })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  limit?: number = 10;

  @ApiProperty({ example: 'EMP001', required: false })
  @IsOptional()
  @IsString()
  employeeId?: string;

  @ApiProperty({ example: 'John Doe', required: false, description: 'ชื่อผู้ขอ' })
  @IsOptional()
  @IsString()
  employeeName?: string;

  @ApiProperty({ example: 'Manager', required: false, description: 'ตำแหน่ง' })
  @IsOptional()
  @IsString()
  employeePosition?: string;

  @ApiProperty({ example: 'IT Department', required: false })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiProperty({ example: 'Project Alpha', required: false })
  @IsOptional()
  @IsString()
  job?: string;

  @ApiProperty({ example: 'พนักงาน ททท.', required: false, description: 'Employee type filter' })
  @IsOptional()
  @IsString()
  employeeType?: string;

  @ApiProperty({ example: 'รายครั้ง', required: false, description: 'ประเภท' })
  @IsOptional()
  @IsString()
  entertainmentType?: string;

  @ApiProperty({ example: 'มกราคม', required: false, description: 'เดือนที่ทำรายงาน' })
  @IsOptional()
  @IsString()
  month?: string;

  @ApiProperty({ example: 15000, required: false, description: 'จำนวนเงิน' })
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  totalAmount?: number;

  @ApiProperty({ example: 20000, required: false, description: 'จำนวนเงินขั้นต่ำ' })
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  minAmount?: number;

  @ApiProperty({ example: 50000, required: false, description: 'จำนวนเงินสูงสุด' })
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  maxAmount?: number;

  @ApiProperty({ enum: EntertainmentFormStatus, required: false })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsEnum(EntertainmentFormStatus)
  statusId?: EntertainmentFormStatus;

  @ApiProperty({ example: 'created_at', required: false })
  @IsOptional()
  @IsString()
  orderBy?: string = 'created_at';

  @ApiProperty({ example: 'desc', required: false })
  @IsOptional()
  @IsString()
  direction?: 'asc' | 'desc' = 'desc';

  @ApiProperty({
    example: '2024-01-01',
    required: false,
    description: 'วันที่ทำเรื่องเริ่มต้น (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => {
    if (!value) return value;
    // Ensure date is in YYYY-MM-DD format
    const date = new Date(value);
    if (isNaN(date.getTime())) return value;
    return date.toISOString().split('T')[0];
  })
  startDate?: string;

  @ApiProperty({
    example: '2024-12-31',
    required: false,
    description: 'วันที่ทำเรื่องสิ้นสุด (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => {
    if (!value) return value;
    // Ensure date is in YYYY-MM-DD format
    const date = new Date(value);
    if (isNaN(date.getTime())) return value;
    return date.toISOString().split('T')[0];
  })
  endDate?: string;

  @ApiProperty({ example: 'search text', required: false })
  @IsOptional()
  @IsString()
  searchTerm?: string;
}
