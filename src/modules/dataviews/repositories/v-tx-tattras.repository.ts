import { Injectable } from '@nestjs/common';
import { VTxTattras, VTxTattrasPaginate } from '../entities/v-tx-tattras.entity';
import { KnexBaseRepository } from '../../../common/repositories/knex-base.repository';
import { KnexService } from '../../../database/knex-service/knex.service';
import { toCamelCase } from '../../../common/utils/case-mapping';
import { QueryVTxTattrasDto } from '../dto/query-v-tx-tattras.dto';

@Injectable()
export class VTxTattrasRepository extends KnexBaseRepository<VTxTattras> {
  constructor(knexService: KnexService) {
    super(knexService, 'V_TX_TATTRAS');
  }

  async findWithQuery(query: QueryVTxTattrasDto): Promise<VTxTattrasPaginate> {
    const conditions: Record<string, any> = {};
    if (query.budYear) conditions['BUD_YEAR'] = query.budYear;
    if (query.sectionCode) conditions['SECTION_CODE'] = query.sectionCode;
    if (query.overviewStrategyId) conditions['OVERVIEW_STRATEGY_ID'] = query.overviewStrategyId;
    if (query.activitySubCode) conditions['ACTIVITY_SUB_CODE'] = query.activitySubCode;
    if (query.outputPlanCode) conditions['OUTPUT_PLAN_CODE'] = query.outputPlanCode;
    if (query.budgetCode) conditions['BUDGET_CODE'] = query.budgetCode;

    let builder = this.knex(this.tableName).where(conditions);

    if (query.sectionName) {
      builder = builder.whereRaw('LOWER("SECTION_NAME") LIKE ?', [
        `%${query.sectionName.toLowerCase()}%`,
      ]);
    }

    if (query.overviewStrategyNameTh) {
      builder = builder.whereRaw('LOWER("OVERVIEW_STRATEGY_NAME_TH") LIKE ?', [
        `%${query.overviewStrategyNameTh.toLowerCase()}%`,
      ]);
    }

    if (query.activitySubDesc) {
      builder = builder.whereRaw('LOWER("ACTIVITY_SUB_DESC") LIKE ?', [
        `%${query.activitySubDesc.toLowerCase()}%`,
      ]);
    }

    if (query.outputPlanDesc) {
      builder = builder.whereRaw('LOWER("OUTPUT_PLAN_DESC") LIKE ?', [
        `%${query.outputPlanDesc.toLowerCase()}%`,
      ]);
    }

    if (query.limit !== undefined) builder = builder.limit(query.limit);
    if (query.offset !== undefined) builder = builder.offset(query.offset);

    const countQuery = this.knex(this.tableName).where(conditions);
    if (query.sectionName) {
      countQuery.whereRaw('LOWER("SECTION_NAME") LIKE ?', [
        `%${query.sectionName.toLowerCase()}%`,
      ]);
    }
    if (query.overviewStrategyNameTh) {
      countQuery.whereRaw('LOWER("OVERVIEW_STRATEGY_NAME_TH") LIKE ?', [
        `%${query.overviewStrategyNameTh.toLowerCase()}%`,
      ]);
    }
    if (query.activitySubDesc) {
      countQuery.whereRaw('LOWER("ACTIVITY_SUB_DESC") LIKE ?', [
        `%${query.activitySubDesc.toLowerCase()}%`,
      ]);
    }
    if (query.outputPlanDesc) {
      countQuery.whereRaw('LOWER("OUTPUT_PLAN_DESC") LIKE ?', [
        `%${query.outputPlanDesc.toLowerCase()}%`,
      ]);
    }

    const countResult = await countQuery.count('* as count').first();
    const total = Number(countResult?.count || 0);

    const dbEntities = await builder.select();
    const data = await Promise.all(
      dbEntities.map(async (e) => await toCamelCase<VTxTattras>(e)),
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
