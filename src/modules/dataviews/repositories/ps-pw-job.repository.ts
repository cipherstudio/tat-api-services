import { Injectable } from '@nestjs/common';
import { PsPwJob } from '../entities/ps-pw-job.entity';
import { KnexBaseRepository } from '../../../common/repositories/knex-base.repository';
import { KnexService } from '../../../database/knex-service/knex.service';
import { toCamelCase } from '../../../common/utils/case-mapping';
import { QueryPsPwJobDto } from '../dto/query-ps-pw-job.dto';

@Injectable()
export class PsPwJobRepository extends KnexBaseRepository<PsPwJob> {
  constructor(knexService: KnexService) {
    super(knexService, 'PS_PW_JOB');
  }

  async findWithQuery(query: QueryPsPwJobDto): Promise<{
    data: PsPwJob[];
    meta: { total: number; limit: number; offset: number };
  }> {
    const conditions: Record<string, any> = {};
    if (query.emplid) conditions['EMPLID'] = query.emplid;
    if (query.deptid) conditions['DEPTID'] = query.deptid;
    if (query.positionNbr) conditions['POSITION_NBR'] = query.positionNbr;

    let builder = this.knex(this.tableName).where(conditions);
    if (query.limit !== undefined) builder = builder.limit(query.limit);
    if (query.offset !== undefined) builder = builder.offset(query.offset);

    // นับจำนวนทั้งหมด (ไม่ใส่ limit/offset)
    const countQuery = this.knex(this.tableName).where(conditions);
    const countResult = await countQuery.count('* as count').first();
    const total = Number(countResult?.count || 0);

    const dbEntities = await builder.select();
    const data = await Promise.all(
      dbEntities.map(async (e) => await toCamelCase<PsPwJob>(e)),
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
