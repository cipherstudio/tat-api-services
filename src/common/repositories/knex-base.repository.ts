import { Inject } from '@nestjs/common';
import { Knex } from 'knex';
import { KnexService } from '../../database/knex-service/knex.service';

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

  async findById(id: number): Promise<T | undefined> {
    return this.knexService.findById(this.tableName, id) as Promise<
      T | undefined
    >;
  }

  async findOne(conditions: Record<string, any>): Promise<T | undefined> {
    return this.knexService.findOne(this.tableName, conditions) as Promise<
      T | undefined
    >;
  }

  async find(conditions: Record<string, any> = {}): Promise<T[]> {
    return this.knexService.findMany(this.tableName, conditions) as Promise<
      T[]
    >;
  }

  async findWithPagination(
    page: number = 1,
    limit: number = 10,
    conditions: Record<string, any> = {},
    orderBy: string = 'id',
    direction: 'asc' | 'desc' = 'asc',
  ) {
    return this.knexService.findWithPagination(
      this.tableName,
      page,
      limit,
      conditions,
      orderBy,
      direction,
    );
  }

  async create(data: Partial<T>): Promise<T> {
    return this.knexService.create(this.tableName, data) as Promise<T>;
  }

  async save(entity: Partial<T>): Promise<T> {
    if ('id' in entity && entity.id) {
      return this.update(entity.id as number, entity);
    }
    return this.create(entity);
  }

  async update(id: number, data: Partial<T>): Promise<T> {
    return this.knexService.update(this.tableName, id, data) as Promise<T>;
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
