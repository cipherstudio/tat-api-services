import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMasterdataLabelsDto {
  // @ApiProperty({ description: 'ชื่อตาราง' })
  // @IsString()
  // table_name: string;
  // @ApiProperty({ description: 'คำอธิบายตาราง', required: false })
  // @IsOptional()
  // @IsString()
  // table_description?: string;
  // @ApiProperty({ description: 'เลขที่เอกสารอ้างอิง' })
  // @IsString()
  // document_reference: string;
  @ApiProperty({ description: 'ชื่อเอกสารอ้างอิง' })
  @IsString()
  documentName: string;
  // @ApiProperty({ description: 'วันที่ของเอกสาร', required: false })
  // @IsOptional()
  // @IsDateString()
  // document_date?: string;
  // @ApiProperty({ description: 'URL ของเอกสาร', required: false })
  // @IsOptional()
  // @IsString()
  // document_url?: string;
  // @ApiProperty({ description: 'ผู้ที่อัพเดตข้อมูล' })
  // @IsString()
  // updated_by: string;
}
