import { Injectable } from '@nestjs/common';
import { Provinces } from '../entities/provinces.entity';
import { KnexBaseRepository } from '../../../common/repositories/knex-base.repository';
import { KnexService } from '../../../database/knex-service/knex.service';
import { toCamelCase, toSnakeCase } from '../../../common/utils/case-mapping';

@Injectable()
export class ProvincesRepository extends KnexBaseRepository<Provinces> {
  constructor(knexService: KnexService) {
    super(knexService, 'provinces');
  }

  async create(entity: Partial<Provinces>): Promise<Provinces> {
    const dbEntity = await toSnakeCase(entity);
    const created = await super.create(dbEntity);
    return await toCamelCase<Provinces>(created);
  }

  async update(id: number, entity: Partial<Provinces>): Promise<Provinces> {
    const dbEntity = await toSnakeCase(entity);
    const updated = await super.update(id, dbEntity);
    return await toCamelCase<Provinces>(updated);
  }

  async findById(id: number): Promise<Provinces | undefined> {
    const dbEntity = await super.findById(id);
    return dbEntity ? await toCamelCase<Provinces>(dbEntity) : undefined;
  }

  async findOne(conditions: Record<string, any>): Promise<Provinces | undefined> {
    const dbEntity = await super.findOne(conditions);
    return dbEntity ? await toCamelCase<Provinces>(dbEntity) : undefined;
  }

  async find(conditions: Record<string, any> = {}): Promise<Provinces[]> {
    const dbEntities = await super.find(conditions);
    return Promise.all(dbEntities.map(async (e) => await toCamelCase<Provinces>(e)));
  }

  async findWithPagination(
    page: number = 1,
    limit: number = 10,
    conditions: Record<string, any> = {},
    orderBy: string = 'id',
    direction: 'asc' | 'desc' = 'asc',
  ) {
    const result = await super.findWithPagination(page, limit, conditions, orderBy, direction);
    return {
      ...result,
      data: await Promise.all(result.data.map(async (e) => await toCamelCase<Provinces>(e))),
    };
  }

  async findWithPaginationAndSearch(
    page: number = 1,
    limit: number = 10,
    conditions: Record<string, any> = {},
    orderBy: string = 'id',
    direction: 'asc' | 'desc' = 'asc',
    searchTerm?: string,
  ) {
    const query = this.knex(this.tableName);

    // Apply base conditions
    if (Object.keys(conditions).length > 0) {
      query.where(conditions);
    }

    // Apply search term if provided
    if (searchTerm) {
      query.where((builder) => {
        builder
          .whereRaw('LOWER("name_en") LIKE ?', [`%${searchTerm.toLowerCase()}%`])
          .orWhereRaw('"name_th" LIKE ?', [`%${searchTerm}%`]);
      });
    }

    const offset = (page - 1) * limit;

    // Get total count with search conditions
    const countResult = await query.clone().count('* as count').first();
    const total = Number(countResult?.count || 0);

    // Get paginated data
    const data = await query
      .orderBy(orderBy, direction)
      .limit(limit)
      .offset(offset);

    return {
      data: await Promise.all(data.map(async (e) => await toCamelCase<Provinces>(e))),
      meta: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit),
      },
    };
  }
} 