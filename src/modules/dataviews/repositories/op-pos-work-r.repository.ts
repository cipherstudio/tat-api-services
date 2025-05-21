import { Injectable } from '@nestjs/common';
import {
  OpPosWorkR,
  OpPosWorkRPaginate,
} from '../entities/op-pos-work-r.entity';
import { KnexBaseRepository } from '../../../common/repositories/knex-base.repository';
import { KnexService } from '../../../database/knex-service/knex.service';
import { toCamelCase } from '../../../common/utils/case-mapping';
import { QueryOpPosWorkRDto } from '../dto/query-op-pos-work-r.dto';

@Injectable()
export class OpPosWorkRRepository extends KnexBaseRepository<OpPosWorkR> {
  constructor(knexService: KnexService) {
    super(knexService, 'OP_POS_WORK_R');
  }

  async findWithQuery(query: QueryOpPosWorkRDto): Promise<OpPosWorkRPaginate> {
    const conditions: Record<string, any> = {};
    if (query.pspCode) conditions['PSP_CODE'] = query.pspCode;
    if (query.pspDescT) conditions['PSP_DESC_T'] = query.pspDescT;

    let builder = this.knex(this.tableName).where(conditions);
    if (query.limit !== undefined) builder = builder.limit(query.limit);
    if (query.offset !== undefined) builder = builder.offset(query.offset);

    const countQuery = this.knex(this.tableName).where(conditions);
    const countResult = await countQuery.count('* as count').first();
    const total = Number(countResult?.count || 0);

    const dbEntities = await builder.select();
    const data = await Promise.all(
      dbEntities.map(async (e) => await toCamelCase<OpPosWorkR>(e)),
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
