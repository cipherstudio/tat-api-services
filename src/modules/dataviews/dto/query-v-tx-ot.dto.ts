import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsNumber } from 'class-validator';

export class QueryVTxOtDto {
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

  @ApiPropertyOptional({
    description: 'จำนวนรายการต่อหน้า (pagination)',
    type: Number,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit: number = 10;

  @ApiPropertyOptional({
    description: 'ข้ามกี่รายการ (pagination offset)',
    type: Number,
    default: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  offset: number = 0;
}
