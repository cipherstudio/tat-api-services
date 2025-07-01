import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { CommonQueryDto } from '../../../common/dto/common-query.dtp';

export class QueryVBudgetCodeDto extends CommonQueryDto {
  @ApiPropertyOptional({ description: 'BUDGET_CODE' })
  @IsOptional()
  budgetCode?: string;

  @ApiPropertyOptional({ description: 'TYPE_BUDGET' })
  @IsOptional()
  typeBudget?: string;

  @ApiPropertyOptional({ description: 'TYPE_CALENDAR' })
  @IsOptional()
  typeCalendar?: string;
}
