import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { CommonQueryDto } from '../../../common/dto/common-query.dtp';

export class QueryVTxTattrasDto extends CommonQueryDto {
  @ApiPropertyOptional({ description: 'BUD_YEAR' })
  @IsOptional()
  budYear?: string;

  @ApiPropertyOptional({ description: 'SECTION_CODE' })
  @IsOptional()
  sectionCode?: string;

  @ApiPropertyOptional({ description: 'SECTION_NAME' })
  @IsOptional()
  sectionName?: string;

  @ApiPropertyOptional({ description: 'OVERVIEW_STRATEGY_ID' })
  @IsOptional()
  overviewStrategyId?: string;

  @ApiPropertyOptional({ description: 'OVERVIEW_STRATEGY_NAME_TH' })
  @IsOptional()
  overviewStrategyNameTh?: string;

  @ApiPropertyOptional({ description: 'ACTIVITY_SUB_CODE' })
  @IsOptional()
  activitySubCode?: string;

  @ApiPropertyOptional({ description: 'ACTIVITY_SUB_DESC' })
  @IsOptional()
  activitySubDesc?: string;

  @ApiPropertyOptional({ description: 'OUTPUT_PLAN_CODE' })
  @IsOptional()
  outputPlanCode?: string;

  @ApiPropertyOptional({ description: 'OUTPUT_PLAN_DESC' })
  @IsOptional()
  outputPlanDesc?: string;

  @ApiPropertyOptional({ description: 'BUDGET_CODE' })
  @IsOptional()
  budgetCode?: string;
}
