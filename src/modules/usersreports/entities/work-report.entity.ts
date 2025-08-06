import { ApiProperty } from '@nestjs/swagger';

export class WorkReport {
  @ApiProperty({ description: 'ID ของรายงาน' })
  id: number;

  @ApiProperty({ description: 'หมายเลขเอกสาร' })
  documentNumber: string;

  @ApiProperty({ description: 'ชื่อเอกสาร' })
  title: string;

  @ApiProperty({ description: 'ชื่อผู้สร้าง' })
  creatorName: string;

  @ApiProperty({ description: 'รหัสผู้สร้าง' })
  creatorCode: string;

  @ApiProperty({ description: 'รหัสผู้อนุมัติ' })
  approveId: string;

  @ApiProperty({ description: 'สถานะ' })
  status: number;

  @ApiProperty({ description: 'ชื่อสถานะ' })
  statusName: string;

  @ApiProperty({ description: 'วันที่สร้าง' })
  createdAt: Date;

  @ApiProperty({ description: 'วันที่อัปเดต' })
  updatedAt: Date;
} 