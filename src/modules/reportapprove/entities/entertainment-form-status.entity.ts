import { ApiProperty } from '@nestjs/swagger';

export class EntertainmentFormStatus {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'draft' })
  name: string;

  @ApiProperty({ example: 'ร่าง' })
  description: string;

  @ApiProperty({ example: '2024-06-21T10:00:00.000Z' })
  createdAt: Date;

  constructor(partial: Partial<EntertainmentFormStatus>) {
    Object.assign(this, partial);
  }
}
