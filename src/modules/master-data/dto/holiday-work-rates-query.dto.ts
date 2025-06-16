import { IsOptional, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class HolidayWorkRatesQueryDto {
  @ApiProperty({ description: 'ขั้น/ระดับ', required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  step_level?: number;

  @ApiProperty({ description: 'เงินเดือน', required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  salary?: number;

  @ApiProperty({ description: 'จัดเรียงข้อมูล (field)', required: false })
  @IsOptional()
  @IsString()
  sort?: string;

  @ApiProperty({ description: 'หน้าที่ต้องการ', required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number;

  @ApiProperty({ description: 'จำนวนข้อมูลต่อหน้า', required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number;
}
