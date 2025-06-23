import { Injectable } from '@nestjs/common';
import { VTxOt, VTxOtPaginate } from '../entities/v-tx-ot.entity';
import { KnexBaseRepository } from '../../../common/repositories/knex-base.repository';
import { KnexService } from '../../../database/knex-service/knex.service';
import { toCamelCase } from '../../../common/utils/case-mapping';
import { QueryVTxOtDto } from '../dto/query-v-tx-ot.dto';

@Injectable()
export class VTxOtRepository extends KnexBaseRepository<VTxOt> {
  constructor(knexService: KnexService) {
    super(knexService, 'V_TX_OT');
  }

  async findWithQuery(query: QueryVTxOtDto): Promise<VTxOtPaginate> {
    const conditions: Record<string, any> = {};
    if (query.budYear) conditions['BUD_YEAR'] = query.budYear;
    if (query.sectionCode) conditions['SECTION_CODE'] = query.sectionCode;
    if (query.budgetCode) conditions['BUDGET_CODE'] = query.budgetCode;

    let builder = this.knex(this.tableName).where(conditions);

    if (query.sectionName) {
      builder = builder.whereRaw('LOWER("SECTION_NAME") LIKE ?', [
        `%${query.sectionName.toLowerCase()}%`,
      ]);
    }

    if (query.activitySubDesc) {
      builder = builder.whereRaw('LOWER("ACTIVITY_SUB_DESC") LIKE ?', [
        `%${query.activitySubDesc.toLowerCase()}%`,
      ]);
    }

    if (query.activitySubCode) {
      builder = builder.whereRaw('LOWER("ACTIVITY_SUB_CODE") LIKE ?', [
        `%${query.activitySubCode.toLowerCase()}%`,
      ]);
    }

    if (query.outputPlanCode) {
      builder = builder.whereRaw('LOWER("OUTPUT_PLAN_CODE") LIKE ?', [
        `%${query.outputPlanCode.toLowerCase()}%`,
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
    if (query.activitySubDesc) {
      countQuery.whereRaw('LOWER("ACTIVITY_SUB_DESC") LIKE ?', [
        `%${query.activitySubDesc.toLowerCase()}%`,
      ]);
    }

    const countResult = await countQuery.count('* as count').first();
    const total = Number(countResult?.count || 0);

    const dbEntities = await builder.select();
    const data = await Promise.all(
      dbEntities.map(async (e) => await toCamelCase<VTxOt>(e)),
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
