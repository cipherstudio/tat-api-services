import { Injectable } from '@nestjs/common';
import {
  OpPositionNoT,
  OpPositionNoTPaginate,
} from '../entities/op-position-no-t.entity';
import { KnexBaseRepository } from '../../../common/repositories/knex-base.repository';
import { KnexService } from '../../../database/knex-service/knex.service';
import { toCamelCase } from '../../../common/utils/case-mapping';
import { QueryOpPositionNoTDto } from '../dto/query-op-position-no-t.dto';

@Injectable()
export class OpPositionNoTRepository extends KnexBaseRepository<OpPositionNoT> {
  constructor(knexService: KnexService) {
    super(knexService, 'OP_POSITION_NO_T');
  }

  async findWithQuery(
    query: QueryOpPositionNoTDto,
  ): Promise<OpPositionNoTPaginate> {
    const conditions: Record<string, any> = {};
    if (query.ppnNumber) conditions['PPN_NUMBER'] = query.ppnNumber;
    if (query.ppnOrganize) conditions['PPN_ORGANIZE'] = query.ppnOrganize;

    let builder = this.knex(this.tableName).where(conditions);
    if (query.limit !== undefined) builder = builder.limit(query.limit);
    if (query.offset !== undefined) builder = builder.offset(query.offset);

    const countQuery = this.knex(this.tableName).where(conditions);
    const countResult = await countQuery.count('* as count').first();
    const total = Number(countResult?.count || 0);

    const dbEntities = await builder.select();
    const data = await Promise.all(
      dbEntities.map(async (e) => await toCamelCase<OpPositionNoT>(e)),
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
