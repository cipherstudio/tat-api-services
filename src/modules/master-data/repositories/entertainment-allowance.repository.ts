import { Injectable } from '@nestjs/common';
import { KnexBaseRepository } from '../../../common/repositories/knex-base.repository';
import { KnexService } from '../../../database/knex-service/knex.service';
import { toSnakeCase } from '../../../common/utils/case-mapping';
import { EntertainmentAllowance } from '../entities/entertainment-allowance.entity';

@Injectable()
export class EntertainmentAllowanceRepository extends KnexBaseRepository<EntertainmentAllowance> {
  constructor(knexService: KnexService) {
    super(knexService, 'entertainment_allowances');
  }

  async findWithPaginationAndSearch(query: any) {
    const {
      page = 1,
      limit = 10,
      title,
      minDays,
      maxDays,
      amount,
      level,
    } = query;
    const filter: any = {};
    if (title) filter.title = title;
    if (minDays !== undefined) filter.min_days = minDays;
    if (maxDays !== undefined) filter.max_days = maxDays;
    if (amount !== undefined) filter.amount = amount;
    const dbFilter = await toSnakeCase(filter);
    const offset = (page - 1) * limit;

    // 1. ดึง id จาก entertainment_allowances (ถ้ามี level ให้ join กับ levels ก่อน)
    let idQuery = this.knex('entertainment_allowances');
    if (Object.keys(dbFilter).length > 0) idQuery = idQuery.where(dbFilter);
    if (level !== undefined) {
      idQuery = idQuery
        .join(
          'entertainment_allowance_levels',
          'entertainment_allowances.id',
          'entertainment_allowance_levels.allowance_id',
        )
        .where('entertainment_allowance_levels.position_level', level)
        .distinct('entertainment_allowances.id');
    }
    const countResult = await idQuery
      .clone()
      .countDistinct('entertainment_allowances.id as count')
      .first();
    const total = Number(countResult?.count || 0);
    const idRows = await idQuery
      .clone()
      .orderBy('entertainment_allowances.id', 'asc')
      .limit(limit)
      .offset(offset)
      .pluck('entertainment_allowances.id');
    if (idRows.length === 0) {
      return {
        data: [],
        meta: { total, page, limit, lastPage: Math.ceil(total / limit) },
      };
    }
    // 2. join กับ levels แล้ว whereIn ตาม idRows
    const rows = await this.knex('entertainment_allowances')
      .leftJoin(
        'entertainment_allowance_levels',
        'entertainment_allowances.id',
        'entertainment_allowance_levels.allowance_id',
      )
      .select(
        'entertainment_allowances.*',
        'entertainment_allowance_levels.id as level_id',
        'entertainment_allowance_levels.position_level',
        'entertainment_allowance_levels.created_at as level_created_at',
        'entertainment_allowance_levels.updated_at as level_updated_at',
      )
      .whereIn('entertainment_allowances.id', idRows)
      .orderBy('entertainment_allowances.id', 'asc');
    const map = new Map();
    for (const row of rows) {
      const allowanceId = row.id;
      if (!map.has(allowanceId)) {
        map.set(allowanceId, {
          id: row.id,
          title: row.title,
          minDays: row.min_days,
          maxDays: row.max_days,
          amount: row.amount,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          levels: [],
        });
      }
      if (row.level_id) {
        map.get(allowanceId).levels.push({
          id: row.level_id,
          allowanceId: row.id,
          positionLevel: row.position_level,
          createdAt: row.level_created_at,
          updatedAt: row.level_updated_at,
        });
      }
    }
    return {
      data: Array.from(map.values()),
      meta: { total, page, limit, lastPage: Math.ceil(total / limit) },
    };
  }

  async findWithLevels(query: Record<string, any> = {}): Promise<any[]> {
    const filter = await toSnakeCase(query);
    let knexQuery = this.knex('entertainment_allowances')
      .leftJoin(
        'entertainment_allowance_levels',
        'entertainment_allowances.id',
        'entertainment_allowance_levels.allowance_id',
      )
      .select(
        'entertainment_allowances.*',
        'entertainment_allowance_levels.id as level_id',
        'entertainment_allowance_levels.position_level',
        'entertainment_allowance_levels.created_at as level_created_at',
        'entertainment_allowance_levels.updated_at as level_updated_at',
      );
    if (Object.keys(filter).length > 0) {
      knexQuery = knexQuery.where(filter);
    }
    const rows = await knexQuery;
    const map = new Map();
    for (const row of rows) {
      const allowanceId = row.id;
      if (!map.has(allowanceId)) {
        map.set(allowanceId, {
          id: row.id,
          title: row.title,
          minDays: row.min_days,
          maxDays: row.max_days,
          amount: row.amount,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          levels: [],
        });
      }
      if (row.level_id) {
        map.get(allowanceId).levels.push({
          id: row.level_id,
          allowanceId: row.id,
          positionLevel: row.position_level,
          createdAt: row.level_created_at,
          updatedAt: row.level_updated_at,
        });
      }
    }
    return Array.from(map.values());
  }

  async createWithLevels(dto: any) {
    const { levels, ...allowanceData } = dto;
    // Check if any of the provided levels are already linked to any allowance
    if (levels && levels.length > 0) {
      const positionLevels = levels.map((l) => l.positionLevel);
      const existing = await this.knex('entertainment_allowance_levels')
        .whereIn('position_level', positionLevels)
        .first();
      if (existing) {
        return {
          success: false,
          message: `Level (positionLevel=${existing.position_level}) is already in use by allowance_id=${existing.allowance_id}`,
        };
      }
    }
    const [allowanceId] = await this.knex('entertainment_allowances').insert(
      allowanceData,
      ['id'],
    );
    const id = typeof allowanceId === 'object' ? allowanceId.id : allowanceId;
    if (levels && levels.length > 0) {
      const rows = levels.map((l) => ({ ...l, allowance_id: id }));
      await this.knex('entertainment_allowance_levels').insert(rows);
    }
    return this.findWithLevels({ id }).then((r) => r[0] || null);
  }

  async updateWithLevels(id: number, dto: any) {
    const { levels, ...allowanceData } = dto;
    // Check if any of the provided levels are already linked to another allowance (excluding this one)
    if (levels) {
      const positionLevels = levels.map((l) => l.positionLevel);
      const existing = await this.knex('entertainment_allowance_levels')
        .whereIn('position_level', positionLevels)
        .whereNot('allowance_id', id)
        .first();
      if (existing) {
        return {
          success: false,
          message: `Level (positionLevel=${existing.position_level}) is already in use by allowance_id=${existing.allowance_id}`,
        };
      }
    }
    await this.knex('entertainment_allowances')
      .where('id', id)
      .update(allowanceData);
    if (levels) {
      await this.knex('entertainment_allowance_levels')
        .where('allowance_id', id)
        .del();
      if (levels.length > 0) {
        const rows = levels.map((l) => ({ ...l, allowance_id: id }));
        await this.knex('entertainment_allowance_levels').insert(rows);
      }
    }
    return this.findWithLevels({ id }).then((r) => r[0] || null);
  }

  async deleteWithLevels(id: number) {
    await this.knex('entertainment_allowance_levels')
      .where('allowance_id', id)
      .del();
    await this.knex('entertainment_allowances').where('id', id).del();
  }

  async getWithLevel(level: number) {
    // Join allowances and levels, filter by positionLevel, group by allowance
    const rows = await this.knex('entertainment_allowances')
      .join(
        'entertainment_allowance_levels',
        'entertainment_allowances.id',
        'entertainment_allowance_levels.allowance_id',
      )
      .select(
        'entertainment_allowances.*',
        'entertainment_allowance_levels.id as level_id',
        'entertainment_allowance_levels.position_level',
        'entertainment_allowance_levels.created_at as level_created_at',
        'entertainment_allowance_levels.updated_at as level_updated_at',
      )
      .where('entertainment_allowance_levels.position_level', level)
      .orderBy('entertainment_allowances.id', 'asc');
    // Group by allowance
    const map = new Map();
    for (const row of rows) {
      const allowanceId = row.id;
      if (!map.has(allowanceId)) {
        map.set(allowanceId, {
          id: row.id,
          title: row.title,
          minDays: row.min_days,
          maxDays: row.max_days,
          amount: row.amount,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          levels: [],
        });
      }
      if (row.level_id) {
        map.get(allowanceId).levels.push({
          id: row.level_id,
          allowanceId: row.id,
          positionLevel: row.position_level,
          createdAt: row.level_created_at,
          updatedAt: row.level_updated_at,
        });
      }
    }
    return Array.from(map.values());
  }
}
