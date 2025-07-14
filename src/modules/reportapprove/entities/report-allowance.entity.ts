import { ApiProperty } from '@nestjs/swagger';

export class ReportAllowance {
  @ApiProperty({ example: 1 })
  allowanceId: number;

  @ApiProperty({ example: 1 })
  formId: number;

  @ApiProperty({ example: 'TYPE' })
  type?: string;

  @ApiProperty({ example: 'CATEGORY' })
  category?: string;

  @ApiProperty({ example: 'SUB_CATEGORY' })
  subCategory?: string;

  @ApiProperty({ example: 3 })
  days?: number;

  @ApiProperty({ example: 4500 })
  total?: number;
}
