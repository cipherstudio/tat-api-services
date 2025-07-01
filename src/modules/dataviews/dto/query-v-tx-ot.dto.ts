import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { CommonQueryDto } from '../../../common/dto/common-query.dtp';

export class QueryVTxOtDto extends CommonQueryDto {
  @ApiPropertyOptional({ description: 'BUD_YEAR' })
  @IsOptional()
  budYear?: Date;

  @ApiPropertyOptional({ description: 'SECTION_CODE' })
  @IsOptional()
  sectionCode?: string;

  @ApiPropertyOptional({ description: 'SECTION_NAME' })
  @IsOptional()
  sectionName?: string;

  @ApiPropertyOptional({ description: 'BUDGET_CODE' })
  @IsOptional()
  budgetCode?: string;

  @ApiPropertyOptional({ description: 'ACTIVITY_SUB_DESC' })
  @IsOptional()
  activitySubDesc?: string;

  @ApiPropertyOptional({ description: 'ACTIVITY_SUB_CODE' })
  @IsOptional()
  activitySubCode?: string;

  @ApiPropertyOptional({ description: 'OUTPUT_PLAN_CODE' })
  @IsOptional()
  outputPlanCode?: string;

  @ApiPropertyOptional({ description: 'OUTPUT_PLAN_DESC' })
  @IsOptional()
  outputPlanDesc?: string;
}
