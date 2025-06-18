import { Injectable } from '@nestjs/common';
import { KnexBaseRepository } from '../../../common/repositories/knex-base.repository';
import { AttireAllowanceRates } from '../entities/attire-allowance-rates.entity';
import { KnexService } from '../../../database/knex-service/knex.service';
import { toCamelCase, toSnakeCase } from '../../../common/utils/case-mapping';

@Injectable()
export class AttireAllowanceRatesRepository extends KnexBaseRepository<AttireAllowanceRates> {
  constructor(knexService: KnexService) {
    super(knexService, 'attire_allowance_rates');
  }

  async create(
    entity: Partial<AttireAllowanceRates>,
  ): Promise<AttireAllowanceRates> {
    const dbEntity = await toSnakeCase(entity);
    const created = await super.create(dbEntity);
    return await toCamelCase<AttireAllowanceRates>(created);
  }

  async update(
    id: number,
    entity: Partial<AttireAllowanceRates>,
  ): Promise<AttireAllowanceRates> {
    const dbEntity = await toSnakeCase(entity);
    const updated = await super.update(id, dbEntity);
    return await toCamelCase<AttireAllowanceRates>(updated);
  }

  async findById(id: number): Promise<AttireAllowanceRates | undefined> {
    const dbEntity = await super.findById(id);
    return dbEntity
      ? await toCamelCase<AttireAllowanceRates>(dbEntity)
      : undefined;
  }

  async findOne(
    conditions: Record<string, any>,
  ): Promise<AttireAllowanceRates | undefined> {
    const dbEntity = await super.findOne(conditions);
    return dbEntity
      ? await toCamelCase<AttireAllowanceRates>(dbEntity)
      : undefined;
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
        if (value === null) {
          query.whereNull(key);
        } else if (
          value !== undefined &&
          key !== 'level_code_start' &&
          key !== 'level_code_end'
        ) {
          query.where(key, value);
        }
      });
    }

    // Apply search term if provided
    if (searchTerm) {
      query.where((builder) => {
        builder
          .whereRaw('LOWER("position_group_name") LIKE ?', [
            `%${searchTerm.toLowerCase()}%`,
          ])
          .orWhereRaw('LOWER("assignment_type") LIKE ?', [
            `%${searchTerm.toLowerCase()}%`,
          ])
          .orWhereRaw('LOWER("destination_type") LIKE ?', [
            `%${searchTerm.toLowerCase()}%`,
          ]);
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
      data: await Promise.all(
        data.map(async (e) => await toCamelCase<AttireAllowanceRates>(e)),
      ),
      meta: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async findByLevelRange(level: number): Promise<AttireAllowanceRates[]> {
    const results = await this.knex(this.tableName)
      .where('level_code_start', '<=', level)
      .where('level_code_end', '>=', level)
      .select('*');

    return Promise.all(
      results.map(async (e) => await toCamelCase<AttireAllowanceRates>(e)),
    );
  }

  async findByAssignmentType(type: string): Promise<AttireAllowanceRates[]> {
    const results = await this.knex(this.tableName)
      .where('assignment_type', type)
      .select('*');

    return Promise.all(
      results.map(async (e) => await toCamelCase<AttireAllowanceRates>(e)),
    );
  }

  async findByDestinationType(type: string): Promise<AttireAllowanceRates[]> {
    const results = await this.knex(this.tableName)
      .where('destination_type', type)
      .select('*');

    return Promise.all(
      results.map(async (e) => await toCamelCase<AttireAllowanceRates>(e)),
    );
  }
}
