import { Injectable } from '@nestjs/common';
import { ExpensesVehicle } from '../entities/expenses-vehicle.entity';
import { KnexBaseRepository } from '../../../common/repositories/knex-base.repository';
import { KnexService } from '../../../database/knex-service/knex.service';
import { toCamelCase, toSnakeCase } from '../../../common/utils/case-mapping';

@Injectable()
export class ExpensesVehicleRepository extends KnexBaseRepository<ExpensesVehicle> {
  constructor(knexService: KnexService) {
    super(knexService, 'expenses_vehicle');
  }

  async findAll(): Promise<ExpensesVehicle[]> {
    const dbEntities = await super.find();
    return Promise.all(dbEntities.map(async (e) => await toCamelCase<ExpensesVehicle>(e)));
  }

  async findById(id: number): Promise<ExpensesVehicle | null> {
    const dbEntity = await super.findById(id);
    return dbEntity ? await toCamelCase<ExpensesVehicle>(dbEntity) : null;
  }

  async update(id: number, data: Partial<ExpensesVehicle>): Promise<ExpensesVehicle> {
    const dbEntity = await toSnakeCase(data);
    const updated = await super.update(id, dbEntity);
    return await toCamelCase<ExpensesVehicle>(updated);
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
        builder.whereRaw('LOWER("code") LIKE ?', [`%${searchTerm.toLowerCase()}%`])
          .orWhereRaw('LOWER("title") LIKE ?', [`%${searchTerm.toLowerCase()}%`]);
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
      data: await Promise.all(data.map(async (e) => await toCamelCase<ExpensesVehicle>(e))),
      meta: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit),
      },
    };
  }
} 