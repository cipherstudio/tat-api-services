import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsNumber } from 'class-validator';

export class QueryVBudgetCodeDto {
  @ApiPropertyOptional({ description: 'BUDGET_CODE' })
  @IsOptional()
  budgetCode?: string;

  @ApiPropertyOptional({ description: 'TYPE_BUDGET' })
  @IsOptional()
  typeBudget?: string;

  @ApiPropertyOptional({ description: 'TYPE_CALENDAR' })
  @IsOptional()
  typeCalendar?: string;

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
