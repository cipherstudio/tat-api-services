import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateExpensesOtherConditionsDto {
  @ApiProperty({ description: 'รหัสค่าใช้จ่ายอื่น' })
  @IsNumber()
  expensesOtherId: number;

  @ApiProperty({ description: 'ชื่อตำแหน่ง', required: false })
  @IsString()
  @IsOptional()
  positionName?: string;

  @ApiProperty({ description: 'รหัสตำแหน่ง', required: false })
  @IsString()
  @IsOptional()
  positionCode?: string;

  @ApiProperty({ description: 'รหัสระดับ', required: false })
  @IsString()
  @IsOptional()
  levelCode?: string;

  @ApiProperty({ description: 'ขอบเขต', required: false, enum: ['domestic', 'international'] })
  @IsEnum(['domestic', 'international'])
  @IsOptional()
  scope?: 'domestic' | 'international';

  @ApiProperty({ description: 'จำนวนเงินสูงสุด' })
  @IsNumber()
  maxAmount: number;
} 