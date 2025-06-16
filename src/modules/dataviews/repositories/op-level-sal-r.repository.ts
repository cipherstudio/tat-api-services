import { Injectable } from '@nestjs/common';
import { OpLevelSalR } from '../entities/op-level-sal-r.entity';
import { KnexBaseRepository } from '../../../common/repositories/knex-base.repository';
import { KnexService } from '../../../database/knex-service/knex.service';
import { toCamelCase } from '../../../common/utils/case-mapping';
import { QueryOpLevelSalRDto } from '../dto/query-op-level-sal-r.dto';

export interface OpLevelSalRPaginate {
  data: OpLevelSalR[];
  meta: {
    total: number;
    limit: number;
    offset: number;
  };
}

@Injectable()
export class OpLevelSalRRepository extends KnexBaseRepository<OpLevelSalR> {
  constructor(knexService: KnexService) {
    super(knexService, 'OP_LEVEL_SAL_R_TEMP');
  }

  async findWithQuery(
    query: QueryOpLevelSalRDto,
  ): Promise<OpLevelSalRPaginate> {
    const conditions: Record<string, any> = {};
    if (query.plvCode) conditions['PLV_CODE'] = query.plvCode;

    let builder = this.knex(this.tableName).where(conditions);
    if (query.limit !== undefined) builder = builder.limit(query.limit);
    if (query.offset !== undefined) builder = builder.offset(query.offset);

    const countQuery = this.knex(this.tableName).where(conditions);
    const countResult = await countQuery.count('* as count').first();
    const total = Number(countResult?.count || 0);

    const dbEntities = await builder.select();
    const data = await Promise.all(
      dbEntities.map(async (e) => await toCamelCase<OpLevelSalR>(e)),
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
