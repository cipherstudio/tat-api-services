import { Injectable } from '@nestjs/common';
import { KnexBaseRepository } from '../../../common/repositories/knex-base.repository';
import { KnexService } from '../../../database/knex-service/knex.service';
import { toSnakeCase } from '../../../common/utils/case-mapping';
import { MealAllowance } from '../entities/meal-allowance.entity';

@Injectable()
export class MealAllowanceRepository extends KnexBaseRepository<MealAllowance> {
  constructor(knexService: KnexService) {
    super(knexService, 'meal_allowance');
  }

  async findWithLevels(query: Record<string, any> = {}): Promise<any[]> {
    const filter = await toSnakeCase(query);
    let knexQuery = this.knex('meal_allowance as ma')
      .leftJoin(
        'meal_allowance_level as mal',
        'ma.meal_allowance_id',
        'mal.meal_allowance_id',
      )
      .select(
        'ma.*',
        'mal.meal_allowance_id as level_meal_allowance_id',
        'mal.level as level_level',
      );
    if (filter.meal_allowance_id) {
      knexQuery = knexQuery.where(
        'ma.meal_allowance_id',
        filter.meal_allowance_id,
      );
    } else if (Object.keys(filter).length > 0) {
      knexQuery = knexQuery.where(filter);
    }
    const rows = await knexQuery;
    const map = new Map();
    for (const row of rows) {
      const id = row.meal_allowance_id;
      if (!map.has(id)) {
        map.set(id, {
          meal_allowance_id: row.meal_allowance_id,
          type: row.type,
          rate_per_day: row.rate_per_day,
          location: row.location,
          created_at: row.created_at,
          updated_at: row.updated_at,
          levels: [],
        });
      }
      if (row.level_meal_allowance_id && row.level_level) {
        map.get(id).levels.push({
          meal_allowance_id: row.level_meal_allowance_id,
          level: row.level_level,
        });
      }
    }
    return Array.from(map.values());
  }

  async findWithPaginationAndSearch(query: any) {
    const { page = 1, limit = 10, type, location, rate_per_day, level } = query;
    const filter: any = {};
    if (type) filter['ma.type'] = type;
    if (location) filter['ma.location'] = location;
    if (rate_per_day !== undefined) filter['ma.rate_per_day'] = rate_per_day;
    const offset = (page - 1) * limit;

    // 1. ดึง meal_allowance_id ที่ตรงกับ filter และ level (ถ้ามี)
    let idQuery = this.knex('meal_allowance as ma');
    if (Object.keys(filter).length > 0) idQuery = idQuery.where(filter);
    if (level) {
      idQuery = idQuery
        .join(
          'meal_allowance_level as mal',
          'ma.meal_allowance_id',
          'mal.meal_allowance_id',
        )
        .where('mal.level', level)
        .distinct('ma.meal_allowance_id');
    }
    const countResult = await idQuery
      .clone()
      .countDistinct('ma.meal_allowance_id as count')
      .first();
    const total = Number(countResult?.count || 0);
    const idRows = await idQuery
      .clone()
      .orderBy('ma.meal_allowance_id', 'asc')
      .limit(limit)
      .offset(offset)
      .pluck('ma.meal_allowance_id');
    if (idRows.length === 0) {
      return {
        data: [],
        meta: { total, page, limit, lastPage: Math.ceil(total / limit) },
      };
    }
    // 2. join กับ meal_allowance_level แล้ว whereIn ตาม idRows
    const rows = await this.knex('meal_allowance as ma')
      .leftJoin(
        'meal_allowance_level as mal',
        'ma.meal_allowance_id',
        'mal.meal_allowance_id',
      )
      .select(
        'ma.*',
        'mal.meal_allowance_id as level_meal_allowance_id',
        'mal.level as level_level',
      )
      .whereIn('ma.meal_allowance_id', idRows)
      .orderBy('ma.meal_allowance_id', 'asc');
    const map = new Map();
    for (const row of rows) {
      const id = row.meal_allowance_id;
      if (!map.has(id)) {
        map.set(id, {
          meal_allowance_id: row.meal_allowance_id,
          type: row.type,
          rate_per_day: row.rate_per_day,
          location: row.location,
          created_at: row.created_at,
          updated_at: row.updated_at,
          levels: [],
        });
      }
      if (row.level_meal_allowance_id && row.level_level) {
        map.get(id).levels.push({
          meal_allowance_id: row.level_meal_allowance_id,
          level: row.level_level,
        });
      }
    }
    return {
      data: Array.from(map.values()),
      meta: { total, page, limit, lastPage: Math.ceil(total / limit) },
    };
  }

  async createWithLevels(dto: any) {
    const { levels, ...mainData } = dto;
    const dbMain = await toSnakeCase(mainData);
    const [created] = await this.knex('meal_allowance')
      .insert(dbMain)
      .returning('*');
    if (levels && levels.length > 0) {
      const dbLevels = levels.map((l) => ({
        meal_allowance_id: created.meal_allowance_id,
        level: l.level,
      }));
      await this.knex('meal_allowance_level').insert(dbLevels);
    }
    return this.findWithLevels({
      meal_allowance_id: created.meal_allowance_id,
    });
  }

  async updateWithLevels(meal_allowance_id: number, dto: any) {
    const { levels, ...mainData } = dto;
    await this.knex('meal_allowance')
      .where({ meal_allowance_id })
      .update(await toSnakeCase(mainData));
    if (levels) {
      await this.knex('meal_allowance_level')
        .where({ meal_allowance_id })
        .del();
      if (levels.length > 0) {
        const dbLevels = levels.map((l) => ({
          meal_allowance_id,
          level: l.level,
        }));
        await this.knex('meal_allowance_level').insert(dbLevels);
      }
    }
    return this.findWithLevels({ meal_allowance_id });
  }

  async deleteWithLevels(meal_allowance_id: number) {
    await this.knex('meal_allowance_level').where({ meal_allowance_id }).del();
    await this.knex('meal_allowance').where({ meal_allowance_id }).del();
    return { success: true };
  }
}
