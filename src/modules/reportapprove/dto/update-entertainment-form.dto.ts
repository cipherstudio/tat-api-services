import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateEntertainmentItemDto } from './create-entertainment-form.dto';

export class UpdateEntertainmentItemDto {
  @ApiProperty({ example: 1 })
  @IsOptional()
  @IsNumber()
  id?: number;

  @ApiProperty({ example: 'เลี้ยงรับรองลูกค้าจากบริษัท ABC' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '10 คน' })
  @IsOptional()
  @IsString()
  peopleCount?: string;

  @ApiProperty({ example: 'โรงแรมแกรนด์ พลาซ่า' })
  @IsOptional()
  @IsString()
  venue?: string;

  @ApiProperty({ example: '2024-06-21' })
  @IsOptional()
  @IsDateString()
  eventDate?: Date;

  @ApiProperty({ example: 'ต้อนรับลูกค้าใหม่' })
  @IsOptional()
  @IsString()
  purpose?: string;

  @ApiProperty({ example: 'R001' })
  @IsOptional()
  @IsString()
  receiptNumber?: string;

  @ApiProperty({ example: 'เล่มที่ 1' })
  @IsOptional()
  @IsString()
  receiptBook?: string;

  @ApiProperty({ example: 5000.0 })
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiProperty({ example: 'ห้าพันบาทถ้วน' })
  @IsOptional()
  @IsString()
  amountText?: string;

  @ApiProperty({ example: 1 })
  @IsOptional()
  @IsNumber()
  displayOrder?: number;
}

export class UpdateEntertainmentFormDto {
  @ApiProperty({ example: 1 })
  @IsOptional()
  @IsNumber()
  id?: number;

  @ApiProperty({ example: 'EMP001' })
  @IsOptional()
  @IsString()
  employeeId?: string;

  @ApiProperty({ example: 'John Doe' })
  @IsOptional()
  @IsString()
  employeeName?: string;

  @ApiProperty({ example: 'Manager' })
  @IsOptional()
  @IsString()
  employeePosition?: string;

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

  @ApiProperty({ example: 'พนักงาน ททท.', description: 'Employee type (พนักงาน ททท., ผู้ว่าการ)' })
  @IsOptional()
  @IsString()
  employeeType?: string;

  @ApiProperty({ example: 'รายครั้ง', description: 'Type of entertainment (รายครั้ง, ประจำเดือน)' })
  @IsOptional()
  @IsString()
  entertainmentType?: string;

  @ApiProperty({ example: 1 })
  @IsOptional()
  @IsNumber()
  statusId?: number;

  @ApiProperty({ example: 15000.0 })
  @IsOptional()
  @IsNumber()
  totalAmount?: number;

  @ApiProperty({ example: 'APP001' })
  @IsOptional()
  @IsString()
  approvedBy?: string;

  @ApiProperty({ example: 'อนุมัติแล้ว' })
  @IsOptional()
  @IsString()
  approvedComment?: string;

  @ApiProperty({ example: 'EMP001' })
  @IsOptional()
  @IsString()
  updatedBy?: string;

  @ApiProperty({ example: 'EMP001' })
  @IsOptional()
  @IsString()
  createdBy?: string;

  @ApiProperty({ type: [UpdateEntertainmentItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateEntertainmentItemDto)
  items?: UpdateEntertainmentItemDto[];
}
