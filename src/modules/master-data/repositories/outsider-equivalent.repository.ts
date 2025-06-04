import { Injectable } from '@nestjs/common';
import { OutsiderEquivalent } from '../entities/outsider-equivalent.entity.js';
import { KnexBaseRepository } from '../../../common/repositories/knex-base.repository.js';
import { KnexService } from '../../../database/knex-service/knex.service.js';
import { toCamelCase, toSnakeCase } from '../../../common/utils/case-mapping.js';

@Injectable()
export class OutsiderEquivalentRepository extends KnexBaseRepository<OutsiderEquivalent> {
  constructor(knexService: KnexService) {
    super(knexService, 'outsider_equivalent');
  }

  async create(entity: Partial<OutsiderEquivalent>): Promise<OutsiderEquivalent> {
    const dbEntity = await toSnakeCase(entity);
    const created = await super.create(dbEntity);
    return await toCamelCase<OutsiderEquivalent>(created);
  }

  async update(id: number, entity: Partial<OutsiderEquivalent>): Promise<OutsiderEquivalent> {
    const dbEntity = await toSnakeCase(entity);
    const updated = await super.update(id, dbEntity);
    return await toCamelCase<OutsiderEquivalent>(updated);
  }

  async findById(id: number): Promise<OutsiderEquivalent | undefined> {
    const dbEntity = await super.findById(id);
    return dbEntity ? await toCamelCase<OutsiderEquivalent>(dbEntity) : undefined;
  }

  async findOne(conditions: Record<string, any>): Promise<OutsiderEquivalent | undefined> {
    const dbEntity = await super.findOne(conditions);
    return dbEntity ? await toCamelCase<OutsiderEquivalent>(dbEntity) : undefined;
  }

  async find(conditions: Record<string, any> = {}): Promise<OutsiderEquivalent[]> {
    const dbEntities = await super.find(conditions);
    return Promise.all(dbEntities.map(async (e) => await toCamelCase<OutsiderEquivalent>(e)));
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
      data: await Promise.all(result.data.map(async (e) => await toCamelCase<OutsiderEquivalent>(e))),
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
        builder.whereRaw('LOWER("name") LIKE ?', [`%${searchTerm.toLowerCase()}%`]);
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
      data: await Promise.all(data.map(async (e) => await toCamelCase<OutsiderEquivalent>(e))),
      meta: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit),
      },
    };
  }
} 