import { Injectable } from '@nestjs/common';
import {
  OpPositionT,
  OpPositionTPaginate,
} from '../entities/op-position-t.entity';
import { KnexBaseRepository } from '../../../common/repositories/knex-base.repository';
import { KnexService } from '../../../database/knex-service/knex.service';
import { toCamelCase } from '../../../common/utils/case-mapping';
import { QueryOpPositionTDto } from '../dto/query-op-position-t.dto';

@Injectable()
export class OpPositionTRepository extends KnexBaseRepository<OpPositionT> {
  constructor(knexService: KnexService) {
    super(knexService, 'OP_POSITION_T');
  }

  async findWithQuery(
    query: QueryOpPositionTDto,
  ): Promise<OpPositionTPaginate> {
    const conditions: Record<string, any> = {};
    if (query.emplid) conditions['EMPLID'] = query.emplid;
    if (query.positionNbr) conditions['POSITION_NBR'] = query.positionNbr;
    if (query.deptid) conditions['DEPTID'] = query.deptid;

    let builder = this.knex(this.tableName).where(conditions);
    if (query.limit !== undefined) builder = builder.limit(query.limit);
    if (query.offset !== undefined) builder = builder.offset(query.offset);

    const countQuery = this.knex(this.tableName).where(conditions);
    const countResult = await countQuery.count('* as count').first();
    const total = Number(countResult?.count || 0);

    const dbEntities = await builder.select();
    const data = await Promise.all(
      dbEntities.map(async (e) => await toCamelCase<OpPositionT>(e)),
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
