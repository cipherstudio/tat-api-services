import { Injectable } from '@nestjs/common';
import {
  OpOrganizeR,
  OpOrganizeRPaginate,
} from '../entities/op-organize-r.entity';
import { KnexBaseRepository } from '../../../common/repositories/knex-base.repository';
import { KnexService } from '../../../database/knex-service/knex.service';
import { toCamelCase } from '../../../common/utils/case-mapping';
import { QueryOpOrganizeRDto } from '../dto/query-op-organize-r.dto';

@Injectable()
export class OpOrganizeRRepository extends KnexBaseRepository<OpOrganizeR> {
  constructor(knexService: KnexService) {
    super(knexService, 'OP_ORGANIZE_R');
  }

  async findWithQuery(
    query: QueryOpOrganizeRDto,
  ): Promise<OpOrganizeRPaginate> {
    const conditions: Record<string, any> = {};
    if (query.pogCode) conditions['POG_CODE'] = query.pogCode;
    if (query.pogDesc) conditions['POG_DESC'] = query.pogDesc;

    let builder = this.knex(this.tableName).where(conditions);
    if (query.limit !== undefined) builder = builder.limit(query.limit);
    if (query.offset !== undefined) builder = builder.offset(query.offset);

    // นับจำนวนทั้งหมด (ไม่ใส่ limit/offset)
    const countQuery = this.knex(this.tableName).where(conditions);
    const countResult = await countQuery.count('* as count').first();
    const total = Number(countResult?.count || 0);

    const dbEntities = await builder.select();
    const data = await Promise.all(
      dbEntities.map(async (e) => await toCamelCase<OpOrganizeR>(e)),
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
