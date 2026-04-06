import { Injectable } from '@nestjs/common';
import { AbDeputy } from '../entities/ab-deputy.entity';
import { KnexBaseRepository } from '../../../common/repositories/knex-base.repository';
import { KnexService } from '../../../database/knex-service/knex.service';
import { toCamelCase } from '../../../common/utils/case-mapping';
import { QueryAbDeputyDto } from '../dto/query-ab-deputy.dto';

function pickRow(row: Record<string, any>, key: string): any {
  return row[key] ?? row[key.toLowerCase()];
}

const ORACLE_IN_MAX_IN_LIST = 1000;

/** GDP_DEPUTY_STATUS: 0 = ทำงาน, 1 = สิ้นสุดการทำงาน, 2 = ยกเลิก */
const AB_DEPUTY_STATUS_ACTIVE = 0;

function chunkArray<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

@Injectable()
export class AbDeputyRepository extends KnexBaseRepository<AbDeputy> {
  constructor(knexService: KnexService) {
    super(knexService, 'AB_DEPUTY');
  }

  /** รูปแบบ leftJoin + builder.on เหมือน employee.repository (OP_ORGANIZE_R) */
  private baseEnrichedQuery() {
    return this.knex({ ad: this.tableName })
      .leftJoin('OP_ORGANIZE_R', (builder) => {
        builder.on(
          'OP_ORGANIZE_R.POG_CODE',
          '=',
          this.knex.raw('RTRIM("ad"."GPD_DEPUTY_POG_CODE")'),
        );
      })
      .leftJoin('OP_POS_EXECUTIVE_R', (builder) => {
        builder.on(
          'OP_POS_EXECUTIVE_R.PPE_CODE',
          '=',
          this.knex.raw('RTRIM("ad"."GDP_DEPUTY_POSITION_EX")'),
        );
      });
  }

  private selectEnrichedColumns() {
    return [
      'ad.GDP_ID',
      'ad.PMT_CODE',
      'ad.GPD_DEPUTY_POG_CODE',
      'ad.GDP_DEPUTY_POSITION_EX',
      'ad.GDP_DEPUTY_PRIORITY',
      'ad.GDP_DEPUTY_START_DATE',
      'ad.GDP_DEPUTY_END_DATE',
      'ad.GDP_DEPUTY_REMARK',
      'ad.GDP_CREATED_BY',
      'ad.GDP_CREATED_DATE',
      'ad.GDP_LAST_UPDATE_BY',
      'ad.GDP_LAST_UPDATE_DATE',
      'ad.GDP_DEPUTY_STATUS',
      'ad.POG_CODE',
      'ad.POG_DESC',
      this.knex.raw('OP_ORGANIZE_R.POG_CODE as "ORG_REF_POG_CODE"'),
      this.knex.raw('OP_ORGANIZE_R.POG_DESC as "ORG_REF_POG_DESC"'),
      this.knex.raw(
        'OP_ORGANIZE_R.POG_ABBREVIATION as "ORG_REF_POG_ABBREVIATION"',
      ),
      this.knex.raw('OP_ORGANIZE_R.POG_DESC_E as "ORG_REF_POG_DESC_E"'),
      this.knex.raw('OP_ORGANIZE_R.POG_TITLE as "ORG_REF_POG_TITLE"'),
      this.knex.raw('OP_ORGANIZE_R.POG_TYPE as "ORG_REF_POG_TYPE"'),
      this.knex.raw('OP_ORGANIZE_R.POG_POSNAME as "ORG_REF_POG_POSNAME"'),
      this.knex.raw('OP_ORGANIZE_R.POG_CURRENCY as "ORG_REF_POG_CURRENCY"'),
      this.knex.raw('OP_POS_EXECUTIVE_R.PPE_CODE as "PEX_REF_PPE_CODE"'),
      this.knex.raw('OP_POS_EXECUTIVE_R.PPE_DESC_T as "PEX_REF_PPE_DESC_T"'),
      this.knex.raw('OP_POS_EXECUTIVE_R.PPE_DESC_E as "PEX_REF_PPE_DESC_E"'),
      this.knex.raw('OP_POS_EXECUTIVE_R.PPE_WEIGHT as "PEX_REF_PPE_WEIGHT"'),
      this.knex.raw(
        'OP_POS_EXECUTIVE_R.PPE_POS_LEV as "PEX_REF_PPE_POS_LEV"',
      ),
    ];
  }

  private async mapEnrichedRow(row: Record<string, any>): Promise<AbDeputy> {
    const col = (key: string) => pickRow(row, key);
    const orgCode = col('ORG_REF_POG_CODE');
    const exCode = col('PEX_REF_PPE_CODE');
    const payload: Record<string, any> = {
      GDP_ID: col('GDP_ID'),
      PMT_CODE: col('PMT_CODE'),
      GPD_DEPUTY_POG_CODE: col('GPD_DEPUTY_POG_CODE'),
      GDP_DEPUTY_POSITION_EX: col('GDP_DEPUTY_POSITION_EX'),
      GDP_DEPUTY_PRIORITY: col('GDP_DEPUTY_PRIORITY'),
      GDP_DEPUTY_START_DATE: col('GDP_DEPUTY_START_DATE'),
      GDP_DEPUTY_END_DATE: col('GDP_DEPUTY_END_DATE'),
      GDP_DEPUTY_REMARK: col('GDP_DEPUTY_REMARK'),
      GDP_CREATED_BY: col('GDP_CREATED_BY'),
      GDP_CREATED_DATE: col('GDP_CREATED_DATE'),
      GDP_LAST_UPDATE_BY: col('GDP_LAST_UPDATE_BY'),
      GDP_LAST_UPDATE_DATE: col('GDP_LAST_UPDATE_DATE'),
      GDP_DEPUTY_STATUS: col('GDP_DEPUTY_STATUS'),
      POG_CODE: col('POG_CODE'),
      POG_DESC: col('POG_DESC'),
    };
    const isExec = col('IS_EXECUTIVE');
    if (isExec !== undefined && isExec !== null && String(isExec).trim() !== '') {
      payload.IS_EXECUTIVE = isExec;
    }

    if (orgCode != null && String(orgCode).trim() !== '') {
      payload.deputyOrganize = {
        POG_CODE: col('ORG_REF_POG_CODE'),
        POG_DESC: col('ORG_REF_POG_DESC'),
        POG_ABBREVIATION: col('ORG_REF_POG_ABBREVIATION'),
        POG_DESC_E: col('ORG_REF_POG_DESC_E'),
        POG_TITLE: col('ORG_REF_POG_TITLE'),
        POG_TYPE: col('ORG_REF_POG_TYPE'),
        POG_POSNAME: col('ORG_REF_POG_POSNAME'),
        POG_CURRENCY: col('ORG_REF_POG_CURRENCY'),
      };
    }

    if (exCode != null && String(exCode).trim() !== '') {
      payload.deputyExecutive = {
        PPE_CODE: col('PEX_REF_PPE_CODE'),
        PPE_DESC_T: col('PEX_REF_PPE_DESC_T'),
        PPE_DESC_E: col('PEX_REF_PPE_DESC_E'),
        PPE_WEIGHT: col('PEX_REF_PPE_WEIGHT'),
        PPE_POS_LEV: col('PEX_REF_PPE_POS_LEV'),
      };
    }

    return toCamelCase<AbDeputy>(payload);
  }

  async findByPmtCode(pmtCode: string): Promise<AbDeputy[]> {
    const trimmed = (pmtCode ?? '').trim();
    if (!trimmed) return [];

    const rows = await this.baseEnrichedQuery()
      .select(this.selectEnrichedColumns())
      .where('ad.GDP_DEPUTY_STATUS', AB_DEPUTY_STATUS_ACTIVE)
      .whereRaw('RTRIM("ad"."PMT_CODE") = ?', [trimmed])
      .orderBy('ad.GDP_DEPUTY_PRIORITY', 'asc');

    return Promise.all(rows.map((r) => this.mapEnrichedRow(r)));
  }

  async findByPmtCodesGrouped(pmtCodes: string[]): Promise<Map<string, AbDeputy[]>> {
    const unique = [
      ...new Set(
        pmtCodes.map((c) => String(c ?? '').trim()).filter((c) => c.length > 0),
      ),
    ];
    const map = new Map<string, AbDeputy[]>();
    if (unique.length === 0) return map;

    const chunks = chunkArray(unique, ORACLE_IN_MAX_IN_LIST);
    const rows = await this.baseEnrichedQuery()
      .select(this.selectEnrichedColumns())
      .where('ad.GDP_DEPUTY_STATUS', AB_DEPUTY_STATUS_ACTIVE)
      .where(function () {
        chunks.forEach((chunk, i) => {
          const placeholders = chunk.map(() => '?').join(', ');
          const sql = `RTRIM("ad"."PMT_CODE") IN (${placeholders})`;
          if (i === 0) {
            this.whereRaw(sql, chunk);
          } else {
            this.orWhereRaw(sql, chunk);
          }
        });
      })
      .orderBy('ad.PMT_CODE', 'asc')
      .orderBy('ad.GDP_DEPUTY_PRIORITY', 'asc');

    const mapped = await Promise.all(rows.map((r) => this.mapEnrichedRow(r)));
    for (const d of mapped) {
      const key = String(d.pmtCode ?? '').trim();
      if (!key) continue;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(d);
    }

    return map;
  }

  async findWithQuery(query: QueryAbDeputyDto): Promise<{
    data: AbDeputy[];
    meta: { total: number; limit: number; offset: number };
  }> {
    const conditions: Record<string, any> = {};
    if (query.gdpId !== undefined) conditions['ad.GDP_ID'] = query.gdpId;
    if (query.pmtCode !== undefined) conditions['ad.PMT_CODE'] = query.pmtCode;
    if (query.pogCode) conditions['ad.POG_CODE'] = query.pogCode;
    if (query.gdpDeputyStatus !== undefined)
      conditions['ad.GDP_DEPUTY_STATUS'] = query.gdpDeputyStatus;

    let builder = this.baseEnrichedQuery()
      .select(this.selectEnrichedColumns())
      .where(conditions);
    if (query.limit !== undefined) builder = builder.limit(query.limit);
    if (query.offset !== undefined) builder = builder.offset(query.offset);

    const plainConditions: Record<string, any> = {};
    if (query.gdpId !== undefined) plainConditions['GDP_ID'] = query.gdpId;
    if (query.pmtCode !== undefined) plainConditions['PMT_CODE'] = query.pmtCode;
    if (query.pogCode) plainConditions['POG_CODE'] = query.pogCode;
    if (query.gdpDeputyStatus !== undefined)
      plainConditions['GDP_DEPUTY_STATUS'] = query.gdpDeputyStatus;

    const countResult = await this.knex(this.tableName)
      .where(plainConditions)
      .count('* as count')
      .first();
    const total = Number(countResult?.count || 0);

    const dbEntities = await builder;
    const data = await Promise.all(
      dbEntities.map((e) => this.mapEnrichedRow(e)),
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
