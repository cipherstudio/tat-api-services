import { ApiProperty } from '@nestjs/swagger';

export class ReportEntertainmentItems {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  reportId: number;

  @ApiProperty({ example: 'เลี้ยงรับรองลูกค้าจากบริษัท ABC' })
  description: string;

  @ApiProperty({ example: '10 คน' })
  peopleCount: string;

  @ApiProperty({ example: 'โรงแรมแกรนด์ พลาซ่า' })
  venue: string;

  @ApiProperty({ example: '2024-06-21' })
  eventDate: Date;

  @ApiProperty({ example: 'ต้อนรับลูกค้าใหม่' })
  purpose: string;

  @ApiProperty({ example: 'R001' })
  receiptNumber: string;

  @ApiProperty({ example: 'เล่มที่ 1' })
  receiptBook: string;

  @ApiProperty({ example: 5000.0 })
  amount: number;

  @ApiProperty({ example: 'ห้าพันบาทถ้วน' })
  amountText: string;

  @ApiProperty({ example: 1 })
  displayOrder: number;

  constructor(partial: Partial<ReportEntertainmentItems>) {
    Object.assign(this, partial);
  }
}
