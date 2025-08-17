import { ApiProperty } from '@nestjs/swagger';

export class MeetingType {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'ประชุมประจำเดือน' })
  name: string;

  @ApiProperty({ example: 'การประชุมประจำเดือนของหน่วยงาน' })
  description?: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: 1 })
  sortOrder: number;

  @ApiProperty({ example: '2024-06-21T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-06-21T10:00:00.000Z' })
  updatedAt: Date;

  constructor(partial: Partial<MeetingType>) {
    Object.assign(this, partial);
  }
}
