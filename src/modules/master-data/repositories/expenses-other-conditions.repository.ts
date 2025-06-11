import { Injectable } from '@nestjs/common';
import { ExpensesOtherConditions } from '../entities/expenses-other-conditions.entity';
import { KnexBaseRepository } from '../../../common/repositories/knex-base.repository';
import { KnexService } from '../../../database/knex-service/knex.service';
import { toCamelCase, toSnakeCase } from '../../../common/utils/case-mapping';

@Injectable()
export class ExpensesOtherConditionsRepository extends KnexBaseRepository<ExpensesOtherConditions> {
  constructor(knexService: KnexService) {
    super(knexService, 'expenses_other_conditions');
  }

  async create(entity: Partial<ExpensesOtherConditions>): Promise<ExpensesOtherConditions> {
    const dbEntity = await toSnakeCase(entity);
    const created = await super.create(dbEntity);
    return await toCamelCase<ExpensesOtherConditions>(created);
  }

  async update(id: number, entity: Partial<ExpensesOtherConditions>): Promise<ExpensesOtherConditions> {
    const dbEntity = await toSnakeCase(entity);
    const updated = await super.update(id, dbEntity);
    return await toCamelCase<ExpensesOtherConditions>(updated);
  }

  async findById(id: number): Promise<ExpensesOtherConditions | undefined> {
    const dbEntity = await super.findById(id);
    return dbEntity ? await toCamelCase<ExpensesOtherConditions>(dbEntity) : undefined;
  }

  async findOne(conditions: Record<string, any>): Promise<ExpensesOtherConditions | undefined> {
    const dbEntity = await super.findOne(conditions);
    return dbEntity ? await toCamelCase<ExpensesOtherConditions>(dbEntity) : undefined;
  }

  async find(conditions: Record<string, any> = {}): Promise<ExpensesOtherConditions[]> {
    const dbEntities = await super.find(conditions);
    return Promise.all(dbEntities.map(async (e) => await toCamelCase<ExpensesOtherConditions>(e)));
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
      data: await Promise.all(result.data.map(async (e) => await toCamelCase<ExpensesOtherConditions>(e))),
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

    // Convert orderBy to snake_case for database
    const dbOrderBy = await toSnakeCase({ [orderBy]: null });
    const dbOrderByKey = Object.keys(dbOrderBy)[0];

    // Get paginated data
    const data = await query
      .orderBy(dbOrderByKey, direction)
      .limit(limit)
      .offset(offset);

    return {
      data: await Promise.all(data.map(async (e) => await toCamelCase<ExpensesOtherConditions>(e))),
      meta: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit),
      },
    };
  }
} 