import { ApiProperty } from '@nestjs/swagger';

export class VTxOtDto {
  @ApiProperty({ required: false })
  budYear?: Date;

  @ApiProperty({ required: false })
  sectionCode?: string;

  @ApiProperty({ required: false })
  sectionName?: string;

  @ApiProperty({ required: false })
  outputPlanCode?: string;

  @ApiProperty({ required: false })
  outputPlanDesc?: string;

  @ApiProperty({ required: false })
  activitySubCode?: string;

  @ApiProperty({ required: false })
  activitySubDesc?: string;

  @ApiProperty({ required: false })
  budgetCode?: string;

  @ApiProperty({ required: false })
  amountCf?: number;
}
