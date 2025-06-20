import { Inject, NotFoundException } from '@nestjs/common';
import { Knex } from 'knex';
import { KnexService } from '../../database/knex-service/knex.service';
import { toCamelCase, toSnakeCase } from '../utils/case-mapping';

export class KnexBaseRepository<T> {
  protected tableName: string;

  constructor(
    @Inject(KnexService) protected readonly knexService: KnexService,
    tableName: string,
  ) {
    this.tableName = tableName;
  }

  // Return the knex instance for custom queries
  get knex(): Knex {
    return this.knexService.knex;
  }

  async findById(
    id: number,
    orderBy: string = 'id',
    direction: 'asc' | 'desc' = 'asc',
  ): Promise<T | undefined> {
    const dbRow = await this.knexService.findById(
      this.tableName,
      id,
      orderBy,
      direction,
    );

    if (!dbRow) throw new NotFoundException('Record not found');
    return await toCamelCase<T>(dbRow);
  }

  async findOne(
    conditions: Record<string, any>,
    orderBy: string = 'id',
    direction: 'asc' | 'desc' = 'asc',
  ): Promise<T | undefined> {
    const dbRow = await this.knexService.findOne(
      this.tableName,
      conditions,
      orderBy,
      direction,
    );
    return dbRow ? await toCamelCase<T>(dbRow) : undefined;
  }

  async find(
    conditions: Record<string, any> = {},
    orderBy: string = 'id',
    direction: 'asc' | 'desc' = 'asc',
  ): Promise<T[]> {
    const dbRows = await this.knexService.findMany(
      this.tableName,
      conditions,
      orderBy,
      direction,
    );
    return Promise.all(dbRows.map(async (row) => await toCamelCase<T>(row)));
  }

  async findWithPagination(
    page: number = 1,
    limit: number = 10,
    conditions: Record<string, any> = {},
    orderBy: string = 'id',
    direction: 'asc' | 'desc' = 'asc',
  ) {
    const result = await this.knexService.findWithPagination(
      this.tableName,
      page,
      limit,
      conditions,
      orderBy,
      direction,
    );
    return {
      ...result,
      data: await Promise.all(
        result.data.map(async (row) => await toCamelCase<T>(row)),
      ),
    };
  }

  async create(data: Partial<T>): Promise<T> {
    const dbData = await toSnakeCase(data);
    const created = await this.knexService.create(this.tableName, dbData);
    return await toCamelCase<T>(created);
  }

  async save(entity: Partial<T>): Promise<T> {
    if ('id' in entity && entity.id) {
      return this.update(entity.id as number, entity);
    }
    return this.create(entity);
  }

  async update(id: number, data: Partial<T>): Promise<T> {
    const dbData = await toSnakeCase(data);
    const updated = await this.knexService.update(this.tableName, id, dbData);
    return await toCamelCase<T>(updated);
  }

  async delete(id: number): Promise<number> {
    return this.knexService.delete(this.tableName, id);
  }

  async transaction<R>(
    callback: (trx: Knex.Transaction) => Promise<R>,
  ): Promise<R> {
    return this.knexService.transaction(callback);
  }
}
