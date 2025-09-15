import { ApiProperty } from '@nestjs/swagger';

export class ReportSettings {
  @ApiProperty({ description: 'Unique identifier' })
  id: number;

  @ApiProperty({ description: 'ชื่อรายงาน' })
  reportName: string;

  @ApiProperty({ description: 'ตัวแปร' })
  code: string;

  @ApiProperty({ description: 'ค่าการตั้งค่า' })
  value: string;

  @ApiProperty({ description: 'สร้างเมื่อ' })
  createdAt: Date;

  @ApiProperty({ description: 'แก้ไขเมื่อ' })
  updatedAt: Date;
}

export const reportSettingsColumnMap = {
  id: 'id',
  reportName: 'report_name',
  code: 'code',
  value: 'value',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
};

export const reportSettingsReverseColumnMap = {
  id: 'id',
  report_name: 'reportName',
  code: 'code',
  value: 'value',
  created_at: 'createdAt',
  updated_at: 'updatedAt',
};
