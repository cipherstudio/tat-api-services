import { Injectable } from '@nestjs/common';
import { OpMasterT, OpMasterTPaginate } from '../entities/op-master-t.entity';
import { KnexBaseRepository } from '../../../common/repositories/knex-base.repository';
import { KnexService } from '../../../database/knex-service/knex.service';
import { toCamelCase } from '../../../common/utils/case-mapping';
import { QueryOpMasterTDto } from '../dto/query-op-master-t.dto';

function normalizePersonName(name: string): string {
  return String(name ?? '')
    .trim()
    .replace(/\s+/g, ' ');
}

@Injectable()
export class OpMasterTRepository extends KnexBaseRepository<OpMasterT> {
  constructor(knexService: KnexService) {
    super(knexService, 'OP_MASTER_T');
  }

  async findWithQuery(query: QueryOpMasterTDto): Promise<OpMasterTPaginate> {
    const conditions: Record<string, any> = {};
    if (query.pmtCode) conditions['PMT_CODE'] = query.pmtCode;
    if (query.pmtNameT) conditions['PMT_NAME_T'] = query.pmtNameT;

    let builder = this.knex(this.tableName).where(conditions);
    if (query.limit !== undefined) builder = builder.limit(query.limit);
    if (query.offset !== undefined) builder = builder.offset(query.offset);

    const countQuery = this.knex(this.tableName).where(conditions);
    const countResult = await countQuery.count('* as count').first();
    const total = Number(countResult?.count || 0);

    const dbEntities = await builder.select();
    const data = await Promise.all(
      dbEntities.map(async (e) => await toCamelCase<OpMasterT>(e)),
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

  async findFirstByPmtNameTMatch(nameT: string): Promise<OpMasterT | null> {
    const normalized = normalizePersonName(nameT);
    if (!normalized) return null;

    const cols = [
      'PMT_CODE',
      'PMT_NAME_T',
      'PMT_NAME_E',
      'PMT_LEVEL_CODE',
      'PMT_POS_NO',
    ] as const;

    let row = await this.knex(this.tableName)
      .select([...cols])
      .whereRaw(
        `TRIM(REGEXP_REPLACE(RTRIM("PMT_NAME_T"), '[[:space:]]+', ' ')) = ?`,
        [normalized],
      )
      .first();

    if (!row) {
      row = await this.knex(this.tableName)
        .select([...cols])
        .whereRaw('RTRIM("PMT_NAME_T") = ?', [normalized])
        .first();
    }

    if (!row) return null;
    return toCamelCase<OpMasterT>(row);
  }
}
