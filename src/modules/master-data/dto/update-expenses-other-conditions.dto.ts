import { IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateExpensesOtherConditionsDto {
  @ApiProperty({ description: 'รหัสค่าใช้จ่ายอื่น', required: false })
  @IsOptional()
  @IsNumber()
  expensesOtherId?: number;

  @ApiProperty({ description: 'ชื่อตำแหน่ง', required: false })
  @IsOptional()
  @IsString()
  positionName?: string;

  @ApiProperty({ description: 'รหัสตำแหน่ง', required: false })
  @IsOptional()
  @IsString()
  positionCode?: string;

  @ApiProperty({ description: 'รหัสระดับ', required: false })
  @IsOptional()
  @IsString()
  levelCode?: string;

  @ApiProperty({ description: 'ขอบเขต', required: false, enum: ['domestic', 'international'] })
  @IsOptional()
  @IsEnum(['domestic', 'international'])
  scope?: 'domestic' | 'international';

  @ApiProperty({ description: 'จำนวนเงินสูงสุด', required: false })
  @IsOptional()
  @IsNumber()
  maxAmount?: number;
} 