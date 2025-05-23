import { Injectable } from '@nestjs/common';
import {
  OpChildrenT,
  OpChildrenTPaginate,
} from '../entities/op-children-t.entity';
import { KnexBaseRepository } from '../../../common/repositories/knex-base.repository';
import { KnexService } from '../../../database/knex-service/knex.service';
import { toCamelCase } from '../../../common/utils/case-mapping';
import { QueryOpChildrenTDto } from '../dto/query-op-children-t.dto';

@Injectable()
export class OpChildrenTRepository extends KnexBaseRepository<OpChildrenT> {
  constructor(knexService: KnexService) {
    super(knexService, 'OP_CHILDREN_T');
  }

  async findWithQuery(
    query: QueryOpChildrenTDto,
  ): Promise<OpChildrenTPaginate> {
    const conditions: Record<string, any> = {};
    if (query.pchCode) conditions['PCH_CODE'] = query.pchCode;
    if (query.pchName) conditions['PCH_NAME'] = query.pchName;

    let builder = this.knex(this.tableName).where(conditions);
    if (query.limit !== undefined) builder = builder.limit(query.limit);
    if (query.offset !== undefined) builder = builder.offset(query.offset);

    // นับจำนวนทั้งหมด (ไม่ใส่ limit/offset)
    const countQuery = this.knex(this.tableName).where(conditions);
    const countResult = await countQuery.count('* as count').first();
    const total = Number(countResult?.count || 0);

    const dbEntities = await builder.select();
    const data = await Promise.all(
      dbEntities.map(async (e) => await toCamelCase<OpChildrenT>(e)),
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
