import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';

export class ExpensesOtherConditions {
  @ApiProperty({ description: 'รหัส' })
  id: number;

  @ApiProperty({ description: 'รหัสค่าใช้จ่ายอื่น' })
  expensesOtherId: number;

  @ApiProperty({ description: 'ชื่อตำแหน่ง' })
  @IsString()
  @IsOptional()
  positionName?: string;

  @ApiProperty({ description: 'รหัสตำแหน่ง' })
  @IsString()
  @IsOptional()
  positionCode?: string;

  @ApiProperty({ description: 'รหัสระดับ' })
  @IsString()
  @IsOptional()
  levelCode?: string;

  @ApiProperty({ description: 'ขอบเขต' })
  @IsEnum(['domestic', 'international'])
  @IsOptional()
  scope?: 'domestic' | 'international';

  @ApiProperty({ description: 'จำนวนเงินสูงสุด' })
  @IsNumber()
  maxAmount: number;

  @ApiProperty({ description: 'วันที่สร้าง' })
  createdAt: Date;

  @ApiProperty({ description: 'วันที่แก้ไข' })
  updatedAt: Date;
} 
