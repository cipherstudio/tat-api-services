import { Injectable } from '@nestjs/common';
import {
  OpPosExecutiveR,
  OpPosExecutiveRPaginate,
} from '../entities/op-pos-executive-r.entity';
import { KnexBaseRepository } from '../../../common/repositories/knex-base.repository';
import { KnexService } from '../../../database/knex-service/knex.service';
import { toCamelCase } from '../../../common/utils/case-mapping';
import { QueryOpPosExecutiveRDto } from '../dto/query-op-pos-executive-r.dto';

@Injectable()
export class OpPosExecutiveRRepository extends KnexBaseRepository<OpPosExecutiveR> {
  constructor(knexService: KnexService) {
    super(knexService, 'OP_POS_EXECUTIVE_R');
  }

  async findWithQuery(
    query: QueryOpPosExecutiveRDto,
  ): Promise<OpPosExecutiveRPaginate> {
    const conditions: Record<string, any> = {};
    if (query.ppeCode) conditions['PPE_CODE'] = query.ppeCode;
    if (query.ppeDescT) conditions['PPE_DESC_T'] = query.ppeDescT;

    let builder = this.knex(this.tableName).where(conditions);
    if (query.limit !== undefined) builder = builder.limit(query.limit);
    if (query.offset !== undefined) builder = builder.offset(query.offset);

    const countQuery = this.knex(this.tableName).where(conditions);
    const countResult = await countQuery.count('* as count').first();
    const total = Number(countResult?.count || 0);

    const dbEntities = await builder.select();
    const data = await Promise.all(
      dbEntities.map(async (e) => await toCamelCase<OpPosExecutiveR>(e)),
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
