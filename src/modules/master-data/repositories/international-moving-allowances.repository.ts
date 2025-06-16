import { Injectable } from '@nestjs/common';
import { KnexBaseRepository } from '../../../common/repositories/knex-base.repository';
import { InternationalMovingAllowances } from '../entities/international-moving-allowances.entity';
import { KnexService } from '../../../database/knex-service/knex.service';
import { toCamelCase, toSnakeCase } from '../../../common/utils/case-mapping';

@Injectable()
export class InternationalMovingAllowancesRepository extends KnexBaseRepository<InternationalMovingAllowances> {
  constructor(knexService: KnexService) {
    super(knexService, 'international_moving_allowances');
  }

  async create(entity: Partial<InternationalMovingAllowances>): Promise<InternationalMovingAllowances> {
    const created = await super.create(entity);
    return await toCamelCase<InternationalMovingAllowances>(created);
  }

  async update(id: number, entity: Partial<InternationalMovingAllowances>): Promise<InternationalMovingAllowances> {
    const updated = await super.update(id, entity);
    return await toCamelCase<InternationalMovingAllowances>(updated);
  }

  async findById(id: number): Promise<InternationalMovingAllowances | undefined> {
    const dbEntity = await super.findById(id);
    return dbEntity ? await toCamelCase<InternationalMovingAllowances>(dbEntity) : undefined;
  }

  async findOne(conditions: Record<string, any>): Promise<InternationalMovingAllowances | undefined> {
    const dbEntity = await super.findOne(conditions);
    return dbEntity ? await toCamelCase<InternationalMovingAllowances>(dbEntity) : undefined;
  }

  async find(conditions: Record<string, any> = {}): Promise<InternationalMovingAllowances[]> {
    const dbEntities = await super.find(conditions);
    return Promise.all(dbEntities.map(async (e) => await toCamelCase<InternationalMovingAllowances>(e)));
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
      const dbConditions = await toSnakeCase(conditions);
      Object.entries(dbConditions).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query.where(key, value);
        }
      });
    }

    // Apply search term if provided
    if (searchTerm) {
      query.where((builder) => {
        builder
          .whereRaw('LOWER("office") LIKE ?', [`%${searchTerm.toLowerCase()}%`])
          .orWhereRaw('LOWER("currency") LIKE ?', [`%${searchTerm.toLowerCase()}%`])
          .orWhereRaw('LOWER("director_salary") LIKE ?', [`%${searchTerm.toLowerCase()}%`])
          .orWhereRaw('LOWER("deputy_director_salary") LIKE ?', [`%${searchTerm.toLowerCase()}%`]);
      });
    }

    const offset = (page - 1) * limit;

    // Get total count with search conditions
    const countResult = await query.clone().count('* as count').first();
    const total = Number(countResult?.count || 0);

    // Convert orderBy to snake_case for database
    const dbOrderBy = await toSnakeCase({ [orderBy]: null });
    const dbOrderByKey = Object.keys(dbOrderBy)[0];

    // Get paginated data
    const data = await query
      .orderBy(dbOrderByKey, direction)
      .limit(limit)
      .offset(offset);

    return {
      data: await Promise.all(data.map(async (e) => await toCamelCase<InternationalMovingAllowances>(e))),
      meta: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async findByOffice(office: string): Promise<InternationalMovingAllowances | undefined> {
    return this.findOne({ office });
  }
} 