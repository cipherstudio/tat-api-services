import { Injectable } from '@nestjs/common';
import {
  ViewPosition4ot,
  ViewPosition4otPaginate,
} from '../entities/view-position-4ot.entity';
import { KnexBaseRepository } from '../../../common/repositories/knex-base.repository';
import { KnexService } from '../../../database/knex-service/knex.service';
import { toCamelCase } from '../../../common/utils/case-mapping';
import { QueryViewPosition4otDto } from '../dto/query-view-position-4ot.dto';

@Injectable()
export class ViewPosition4otRepository extends KnexBaseRepository<ViewPosition4ot> {
  constructor(knexService: KnexService) {
    super(knexService, 'VIEW_POSITION_4OT');
  }

  async findWithQuery(
    query: QueryViewPosition4otDto,
  ): Promise<ViewPosition4otPaginate> {
    const conditions: Record<string, any> = {};
    if (query.posPositioncode)
      conditions['POS_POSITIONCODE'] = query.posPositioncode;
    if (query.posPositionname)
      conditions['POS_POSITIONNAME'] = query.posPositionname;
    if (query.posDeptId) conditions['POS_DEPT_ID'] = query.posDeptId;

    let builder = this.knex(this.tableName).where(conditions);
    if (query.limit !== undefined) builder = builder.limit(query.limit);
    if (query.offset !== undefined) builder = builder.offset(query.offset);

    const countQuery = this.knex(this.tableName).where(conditions);
    const countResult = await countQuery.count('* as count').first();
    const total = Number(countResult?.count || 0);

    const dbEntities = await builder.select();
    const data = await Promise.all(
      dbEntities.map(async (e) => await toCamelCase<ViewPosition4ot>(e)),
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

  async findFirstByTrimmedPositionCode(
    positionCode: string | null | undefined,
  ) {
    const code = String(positionCode ?? '').trim();
    if (!code) return null;
    const row = await this.knex(this.tableName)
      .whereRaw('RTRIM("POS_POSITIONCODE") = ?', [code])
      .select('POS_POSITIONCODE', 'POS_POSITIONNAME')
      .first();
    if (!row) return null;
    return toCamelCase(row) as { posPositioncode?: string; posPositionname?: string };
  }
}
