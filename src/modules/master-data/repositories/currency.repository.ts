import { Injectable } from '@nestjs/common';
import { Currency } from '../entities/currency.entity';
import { KnexBaseRepository } from '../../../common/repositories/knex-base.repository';
import { KnexService } from '../../../database/knex-service/knex.service';
import { toCamelCase, toSnakeCase } from '../../../common/utils/case-mapping';

@Injectable()
export class CurrencyRepository extends KnexBaseRepository<Currency> {
  constructor(knexService: KnexService) {
    super(knexService, 'currencies');
  }

  async create(entity: Partial<Currency>): Promise<Currency> {
    const dbEntity = await toSnakeCase(entity);
    const created = await super.create(dbEntity);
    return await toCamelCase<Currency>(created);
  }

  async update(id: number, entity: Partial<Currency>): Promise<Currency> {
    const dbEntity = await toSnakeCase(entity);
    const updated = await super.update(id, dbEntity);
    return await toCamelCase<Currency>(updated);
  }

  async findById(id: number): Promise<Currency | undefined> {
    const dbEntity = await super.findById(id);
    return dbEntity ? await toCamelCase<Currency>(dbEntity) : undefined;
  }

  async findOne(
    conditions: Record<string, any>,
  ): Promise<Currency | undefined> {
    const dbEntity = await super.findOne(conditions);
    return dbEntity ? await toCamelCase<Currency>(dbEntity) : undefined;
  }

  async find(conditions: Record<string, any> = {}): Promise<Currency[]> {
    const dbEntities = await super.find(conditions);
    return Promise.all(
      dbEntities.map(async (e) => await toCamelCase<Currency>(e)),
    );
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

    if (Object.keys(conditions).length > 0) {
      query.where(conditions);
    }

    if (searchTerm) {
      query.where((builder) => {
        builder
          .whereRaw('LOWER("currency_th") LIKE ?', [
            `%${searchTerm.toLowerCase()}%`,
          ])
          .orWhereRaw('LOWER("currency_code_th") LIKE ?', [
            `%${searchTerm.toLowerCase()}%`,
          ])
          .orWhereRaw('LOWER("currency_en") LIKE ?', [
            `%${searchTerm.toLowerCase()}%`,
          ])
          .orWhereRaw('LOWER("currency_code_en") LIKE ?', [
            `%${searchTerm.toLowerCase()}%`,
          ]);
      });
    }

    const offset = (page - 1) * limit;
    const countResult = await query.clone().count('* as count').first();
    const total = Number(countResult?.count || 0);
    const data = await query
      .orderBy(orderBy, direction)
      .limit(limit)
      .offset(offset);
    return {
      data: await Promise.all(
        data.map(async (e) => await toCamelCase<Currency>(e)),
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
