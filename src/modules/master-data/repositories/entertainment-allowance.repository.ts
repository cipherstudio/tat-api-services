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
      privilegeId,
    } = query;
    const filter: any = {};
    if (title) filter.title = title;
    if (minDays !== undefined) filter.min_days = minDays;
    if (maxDays !== undefined) filter.max_days = maxDays;
    if (amount !== undefined) filter.amount = amount;
    const dbFilter = await toSnakeCase(filter);
    const offset = (page - 1) * limit;

    // 1. ดึง id จาก entertainment_allowances (ถ้ามี privilegeId ให้ join กับ levels ก่อน)
    let idQuery = this.knex('entertainment_allowances');
    if (Object.keys(dbFilter).length > 0) idQuery = idQuery.where(dbFilter);
    if (privilegeId !== undefined) {
      idQuery = idQuery
        .join(
          'entertainment_allowance_levels',
          'entertainment_allowances.id',
          'entertainment_allowance_levels.allowance_id',
        )
        .where('entertainment_allowance_levels.privilege_id', privilegeId)
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
    // 2. join กับ levels และ privilege แล้ว whereIn ตาม idRows
    const rows = await this.knex('entertainment_allowances')
      .leftJoin(
        'entertainment_allowance_levels',
        'entertainment_allowances.id',
        'entertainment_allowance_levels.allowance_id',
      )
      .leftJoin(
        'privilege',
        'entertainment_allowance_levels.privilege_id',
        'privilege.id',
      )
      .select(
        'entertainment_allowances.*',
        'entertainment_allowance_levels.id as level_id',
        'entertainment_allowance_levels.privilege_id as level_privilege_id',
        'entertainment_allowance_levels.privilege_name',
        'entertainment_allowance_levels.created_at as level_created_at',
        'entertainment_allowance_levels.updated_at as level_updated_at',
        'privilege.name as privilege_name_from_table',
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
          privilegeId: row.level_privilege_id,
          privilegeName: row.privilege_name_from_table || row.privilege_name,
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
      .leftJoin(
        'privilege',
        'entertainment_allowance_levels.privilege_id',
        'privilege.id',
      )
      .select(
        'entertainment_allowances.id as allowance_id',
        'entertainment_allowances.title',
        'entertainment_allowances.min_days',
        'entertainment_allowances.max_days',
        'entertainment_allowances.amount',
        'entertainment_allowances.created_at',
        'entertainment_allowances.updated_at',
        'entertainment_allowance_levels.id as level_id',
        'entertainment_allowance_levels.privilege_id',
        'entertainment_allowance_levels.privilege_name',
        'entertainment_allowance_levels.created_at as level_created_at',
        'entertainment_allowance_levels.updated_at as level_updated_at',
        'privilege.name as privilege_name_from_table',
      );
    if (filter.allowance_id) {
      knexQuery = knexQuery.where(
        'entertainment_allowances.id',
        filter.allowance_id,
      );
    } else if (filter.id) {
      knexQuery = knexQuery.where('entertainment_allowances.id', filter.id);
    } else if (Object.keys(filter).length > 0) {
      // remove id from filter to avoid ambiguous
      const rest = { ...filter };
      delete rest.id;
      knexQuery = knexQuery.where(rest);
    }
    const rows = await knexQuery;
    const map = new Map();
    for (const row of rows) {
      const allowanceId = row.allowance_id;
      if (!map.has(allowanceId)) {
        map.set(allowanceId, {
          id: row.allowance_id,
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
          allowanceId: row.allowance_id,
          privilegeId: row.privilege_id,
          privilegeName: row.privilege_name_from_table || row.privilege_name,
          createdAt: row.level_created_at,
          updatedAt: row.level_updated_at,
        });
      }
    }
    return Array.from(map.values());
  }

  async createWithLevels(dto: any) {
    const { levels, ...allowanceData } = dto;
    // Check if any of the provided privileges are already linked to any allowance
    if (levels && levels.length > 0) {
      const privilegeIds = levels.map((l) => l.privilege_id);
      const existing = await this.knex('entertainment_allowance_levels')
        .whereIn('privilege_id', privilegeIds)
        .first();
      if (existing) {
        return {
          success: false,
          message: `Privilege (privilegeId=${existing.privilege_id}) is already in use by allowance_id=${existing.allowance_id}`,
        };
      }
    }
    const [allowanceId] = await this.knex('entertainment_allowances').insert(
      allowanceData,
      ['id'],
    );
    const id = typeof allowanceId === 'object' ? allowanceId.id : allowanceId;
    if (levels && levels.length > 0) {
      // Get privilege names from privilege table
      const privileges = await this.knex('privilege')
        .whereIn(
          'id',
          levels.map((l) => l.privilege_id),
        )
        .select('id', 'name');

      const privilegeMap = new Map(privileges.map((p) => [p.id, p.name]));

      const rows = levels.map((l) => ({
        allowance_id: id,
        privilege_id: l.privilege_id,
        privilege_name: privilegeMap.get(l.privilege_id),
      }));
      await this.knex('entertainment_allowance_levels').insert(rows);
    }
    return this.findWithLevels({ id }).then((r) => r[0] || null);
  }

  async updateWithLevels(id: number, dto: any) {
    const { levels, ...allowanceData } = dto;
    // 1. อัปเดต allowance หลัก
    await this.knex('entertainment_allowances')
      .where('id', id)
      .update(allowanceData);

    // 2. ดึง levels เดิมทั้งหมด
    const oldLevels = await this.knex('entertainment_allowance_levels')
      .where('allowance_id', id)
      .orderBy('id', 'asc');

    // Create sets for efficient lookup
    const oldPrivilegeIds = new Set(oldLevels.map((l) => l.privilege_id));
    const newPrivilegeIds = new Set((levels || []).map((l) => l.privilege_id));

    // Handle updates and inserts
    for (const newLevel of levels || []) {
      if (oldPrivilegeIds.has(newLevel.privilege_id)) {
        // Update existing level
        await this.knex('entertainment_allowance_levels')
          .where({
            allowance_id: id,
            privilege_id: newLevel.privilege_id,
          })
          .update({
            privilege_name: newLevel.privilege_name,
            updated_at: new Date(),
          });
      } else {
        // Insert new level
        await this.knex('entertainment_allowance_levels').insert({
          allowance_id: id,
          privilege_id: newLevel.privilege_id,
          privilege_name: newLevel.privilege_name,
          created_at: new Date(),
          updated_at: new Date(),
        });
      }
    }

    // Handle deletes - remove levels that are in old but not in new
    for (const oldLevel of oldLevels) {
      if (!newPrivilegeIds.has(oldLevel.privilege_id)) {
        await this.knex('entertainment_allowance_levels')
          .where('id', oldLevel.id)
          .del();
      }
    }

    // 4. return ข้อมูลใหม่
    return this.findWithLevels({ id }).then((r) => r[0] || null);
  }

  async deleteWithLevels(id: number) {
    // ลบข้อมูลทั้งหมดใน entertainment_allowance_levels ที่มี allowance_id = id
    await this.knex('entertainment_allowance_levels')
      .where('allowance_id', id)
      .del();
    // ลบ entertainment_allowances ด้วย id
    await this.knex('entertainment_allowances').where('id', id).del();
  }

  async getWithPrivilege(privilegeId: number) {
    // Join allowances and levels, filter by privilegeId, group by allowance
    const rows = await this.knex('entertainment_allowances')
      .join(
        'entertainment_allowance_levels',
        'entertainment_allowances.id',
        'entertainment_allowance_levels.allowance_id',
      )
      .leftJoin(
        'privilege',
        'entertainment_allowance_levels.privilege_id',
        'privilege.id',
      )
      .select(
        'entertainment_allowances.*',
        'entertainment_allowance_levels.id as level_id',
        'entertainment_allowance_levels.privilege_id',
        'entertainment_allowance_levels.privilege_name',
        'entertainment_allowance_levels.created_at as level_created_at',
        'entertainment_allowance_levels.updated_at as level_updated_at',
        'privilege.name as privilege_name_from_table',
      )
      .where('entertainment_allowance_levels.privilege_id', privilegeId)
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
          privilegeId: row.privilege_id,
          privilegeName: row.privilege_name_from_table || row.privilege_name,
          createdAt: row.level_created_at,
          updatedAt: row.level_updated_at,
        });
      }
    }
    return Array.from(map.values());
  }
}
