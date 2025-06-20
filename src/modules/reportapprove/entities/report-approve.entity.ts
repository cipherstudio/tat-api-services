import { ApiProperty } from '@nestjs/swagger';

export class ReportApprove {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Sample Title' })
  title: string;

  @ApiProperty({ example: 'John Doe' })
  creatorName: string;

  @ApiProperty({ example: 'EMP001' })
  creatorCode: string;

  @ApiProperty({ example: 'DOC-2024-001' })
  documentNumber: string;

  @ApiProperty({ example: 1 })
  status: number;

  @ApiProperty({ example: '2024-06-21T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-06-21T10:00:00.000Z' })
  updatedAt: Date;

  constructor(partial: Partial<ReportApprove>) {
    Object.assign(this, partial);
  }
}
