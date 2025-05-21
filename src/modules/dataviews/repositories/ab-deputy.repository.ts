import { Injectable } from '@nestjs/common';
import { AbDeputy } from '../entities/ab-deputy.entity';
import { KnexBaseRepository } from '../../../common/repositories/knex-base.repository';
import { KnexService } from '../../../database/knex-service/knex.service';
import { toCamelCase } from '../../../common/utils/case-mapping';
import { QueryAbDeputyDto } from '../dto/query-ab-deputy.dto';

@Injectable()
export class AbDeputyRepository extends KnexBaseRepository<AbDeputy> {
  constructor(knexService: KnexService) {
    super(knexService, 'AB_DEPUTY');
  }

  async findWithQuery(query: QueryAbDeputyDto): Promise<{
    data: AbDeputy[];
    meta: { total: number; limit: number; offset: number };
  }> {
    const conditions: Record<string, any> = {};
    if (query.gdpId !== undefined) conditions['GDP_ID'] = query.gdpId;
    if (query.pmtCode !== undefined) conditions['PMT_CODE'] = query.pmtCode;
    if (query.pogCode) conditions['POG_CODE'] = query.pogCode;
    if (query.gdpDeputyStatus !== undefined)
      conditions['GDP_DEPUTY_STATUS'] = query.gdpDeputyStatus;

    let builder = this.knex(this.tableName).where(conditions);
    if (query.limit !== undefined) builder = builder.limit(query.limit);
    if (query.offset !== undefined) builder = builder.offset(query.offset);

    // นับจำนวนทั้งหมด (ไม่ใส่ limit/offset)
    const countQuery = this.knex(this.tableName).where(conditions);
    const countResult = await countQuery.count('* as count').first();
    const total = Number(countResult?.count || 0);

    const dbEntities = await builder.select();
    const data = await Promise.all(
      dbEntities.map(async (e) => await toCamelCase<AbDeputy>(e)),
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
