import { ApiProperty } from '@nestjs/swagger';

export class ReportAccommodation {
  @ApiProperty({ example: 1 })
  accommodationId: number;

  @ApiProperty({ example: 1 })
  formId: number;

  @ApiProperty({ example: 'Hotel' })
  type?: string;

  @ApiProperty({ example: 1500 })
  pricePerDay?: number;

  @ApiProperty({ example: 3 })
  days?: number;

  @ApiProperty({ example: 4500 })
  total?: number;
}
