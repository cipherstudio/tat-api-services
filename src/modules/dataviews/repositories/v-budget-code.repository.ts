import { Injectable } from '@nestjs/common';
import {
  VBudgetCode,
  VBudgetCodePaginate,
} from '../entities/v-budget-code.entity';
import { KnexBaseRepository } from '../../../common/repositories/knex-base.repository';
import { KnexService } from '../../../database/knex-service/knex.service';
import { toCamelCase } from '../../../common/utils/case-mapping';
import { QueryVBudgetCodeDto } from '../dto/query-v-budget-code.dto';

@Injectable()
export class VBudgetCodeRepository extends KnexBaseRepository<VBudgetCode> {
  constructor(knexService: KnexService) {
    super(knexService, 'V_BUDGET_CODE');
  }

  async findWithQuery(
    query: QueryVBudgetCodeDto,
  ): Promise<VBudgetCodePaginate> {
    const conditions: Record<string, any> = {};
    if (query.budgetCode) conditions['BUDGET_CODE'] = query.budgetCode;
    if (query.typeBudget) conditions['TYPE_BUDGET'] = query.typeBudget;
    if (query.typeCalendar) conditions['TYPE_CALENDAR'] = query.typeCalendar;

    let builder = this.knex(this.tableName).where(conditions);
    if (query.limit !== undefined) builder = builder.limit(query.limit);
    if (query.offset !== undefined) builder = builder.offset(query.offset);

    const countQuery = this.knex(this.tableName).where(conditions);
    const countResult = await countQuery.count('* as count').first();
    const total = Number(countResult?.count || 0);

    const dbEntities = await builder.select();
    const data = await Promise.all(
      dbEntities.map(async (e) => await toCamelCase<VBudgetCode>(e)),
    );
    return {
      data,
      meta: {
        total,
        limit: query.limit ?? 10,
        offset: query.offset ?? 0,
      },
    };
  }
}
