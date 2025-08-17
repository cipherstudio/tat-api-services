import { Injectable } from '@nestjs/common';
import { ExpensesOther } from '../entities/expenses-other.entity';
import { KnexBaseRepository } from '../../../common/repositories/knex-base.repository';
import { KnexService } from '../../../database/knex-service/knex.service';
import { toCamelCase, toSnakeCase } from '../../../common/utils/case-mapping';

@Injectable()
export class ExpensesOtherRepository extends KnexBaseRepository<ExpensesOther> {
  constructor(knexService: KnexService) {
    super(knexService, 'expenses_other');
  }

  async create(entity: Partial<ExpensesOther>): Promise<ExpensesOther> {
    const dbEntity = await toSnakeCase(entity);
    const created = await super.create(dbEntity);
    return await toCamelCase<ExpensesOther>(created);
  }

  async update(
    id: number,
    entity: Partial<ExpensesOther>,
  ): Promise<ExpensesOther> {
    const dbEntity = await toSnakeCase(entity);
    const updated = await super.update(id, dbEntity);
    return await toCamelCase<ExpensesOther>(updated);
  }

  async findById(id: number): Promise<ExpensesOther | undefined> {
    const dbEntity = await super.findById(id);
    return dbEntity ? await toCamelCase<ExpensesOther>(dbEntity) : undefined;
  }

  async findOne(
    conditions: Record<string, any>,
  ): Promise<ExpensesOther | undefined> {
    const dbEntity = await super.findOne(conditions);
    return dbEntity ? await toCamelCase<ExpensesOther>(dbEntity) : undefined;
  }

  async find(conditions: Record<string, any> = {}): Promise<ExpensesOther[]> {
    const dbEntities = await super.find(conditions);
    return Promise.all(
      dbEntities.map(async (e) => await toCamelCase<ExpensesOther>(e)),
    );
  }

  async findWithPagination(
    page: number = 1,
    limit: number = 10,
    conditions: Record<string, any> = {},
    orderBy: string = 'id',
    direction: 'asc' | 'desc' = 'asc',
  ) {
    const result = await super.findWithPagination(
      page,
      limit,
      conditions,
      orderBy,
      direction,
    );
    return {
      ...result,
      data: await Promise.all(
        result.data.map(async (e) => await toCamelCase<ExpensesOther>(e)),
      ),
    };
  }

  async findWithPaginationAndSearch(
    offset: number = 0,
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
        builder.whereRaw('LOWER("name") LIKE ?', [
          `%${searchTerm.toLowerCase()}%`,
        ]);
      });
    }

    // const offset = (page - 1) * limit;

    // Get total count with search conditions
    const countResult = await query.clone().count('* as count').first();
    const total = Number(countResult?.count || 0);

    // Get paginated data
    const data = await query
      .orderBy(orderBy, direction)
      .limit(limit)
      .offset(offset);

    return {
      data: await Promise.all(
        data.map(async (e) => await toCamelCase<ExpensesOther>(e)),
      ),
      meta: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit),
      },
    };
  }
}
