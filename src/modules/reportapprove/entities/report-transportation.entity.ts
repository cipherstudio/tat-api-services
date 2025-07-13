import { ApiProperty } from '@nestjs/swagger';

export class ReportTransportation {
  @ApiProperty({ example: 1 })
  transportId: number;

  @ApiProperty({ example: 1 })
  formId: number;

  @ApiProperty({ example: 'รถยนต์' })
  type?: string;

  @ApiProperty({ example: 'กรุงเทพฯ' })
  fromPlace?: string;

  @ApiProperty({ example: 'เชียงใหม่' })
  toPlace?: string;

  @ApiProperty({ example: '2025-07-10' })
  date?: Date;

  @ApiProperty({ example: 1200 })
  amount?: number;

  @ApiProperty({ example: '/uploads/receipts/abc.pdf' })
  receiptFilePath?: string;
}
