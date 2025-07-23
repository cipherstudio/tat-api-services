import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CreateEntertainmentItemDto {
  @ApiProperty({ example: 'เลี้ยงรับรองลูกค้าจากบริษัท ABC' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '10 คน' })
  @IsOptional()
  @IsString()
  peopleCount?: string;

  @ApiProperty({ example: 'โรงแรมแกรนด์ พลาซ่า' })
  @IsNotEmpty()
  @IsString()
  venue: string;

  @ApiProperty({ example: '2024-06-21' })
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => {
    if (!value) return value;
    // Ensure date is in YYYY-MM-DD format
    const date = new Date(value);
    if (isNaN(date.getTime())) return value;
    return date.toISOString().split('T')[0];
  })
  eventDate: Date;

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
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiProperty({ example: 'ห้าพันบาทถ้วน' })
  @IsOptional()
  @IsString()
  amountText?: string;

  @ApiProperty({ example: 1 })
  @IsOptional()
  @IsNumber()
  displayOrder?: number;
}

export class CreateEntertainmentFormDto {
  @ApiProperty({ example: 'EMP001' })
  @IsNotEmpty()
  @IsString()
  employeeId: string;

  @ApiProperty({ example: 'John Doe' })
  @IsNotEmpty()
  @IsString()
  employeeName: string;

  @ApiProperty({ example: 'Manager' })
  @IsNotEmpty()
  @IsString()
  employeePosition: string;

  @ApiProperty({ example: 'IT Department' })
  @IsNotEmpty()
  @IsString()
  department: string;

  @ApiProperty({ example: 'Development Team' })
  @IsOptional()
  @IsString()
  section?: string;

  @ApiProperty({ example: 'Project Alpha' })
  @IsNotEmpty()
  @IsString()
  job: string;

  @ApiProperty({ example: 1 })
  @IsOptional()
  @IsNumber()
  statusId?: number;

  @ApiProperty({ example: 15000.0 })
  @IsOptional()
  @IsNumber()
  totalAmount?: number;

  @ApiProperty({ example: 'EMP001' })
  @IsNotEmpty()
  @IsString()
  createdBy: string;

  @ApiProperty({ type: [CreateEntertainmentItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateEntertainmentItemDto)
  items: CreateEntertainmentItemDto[];
}
