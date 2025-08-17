import { ApiProperty } from '@nestjs/swagger';

export class ReportOtherExpense {
  @ApiProperty({ example: 1 })
  expenseId: number;

  @ApiProperty({ example: 1 })
  formId: number;

  @ApiProperty({ example: 'ค่าธรรมเนียม' })
  name?: string;

  @ApiProperty({ example: 500 })
  amount?: number;

  @ApiProperty({ example: '/uploads/certificates/abc.pdf' })
  certificateFilePath?: string;
}
