import { ApiProperty } from '@nestjs/swagger';

export class VBudgetCodeDto {
  @ApiProperty({ required: false })
  budgetCode?: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ required: false })
  typeBudget?: string;

  @ApiProperty({ required: false })
  typeCalendar?: string;

  @ApiProperty({ required: false })
  dateUpdate?: Date;

  @ApiProperty({ required: false })
  timeUpdate?: string;

  @ApiProperty({ required: false })
  flagBudget?: number;

  @ApiProperty({ required: false })
  typeCodeBudget?: string;

  @ApiProperty({ required: false })
  receiveGroup?: string;

  @ApiProperty({ required: false })
  flagAlert?: number;
}
