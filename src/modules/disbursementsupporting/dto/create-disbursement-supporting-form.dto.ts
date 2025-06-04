import { IsString, IsOptional, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDisbursementSupportingFormDto {
  @ApiProperty({ description: 'รหัสประเภทเอกสาร' })
  @IsInt()
  documentTypeId: number;

  @ApiProperty({ description: 'ชื่อฟอร์ม' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'รายละเอียด', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'หมายเหตุ', required: false })
  @IsOptional()
  @IsString()
  remark?: string;
}
