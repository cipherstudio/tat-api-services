import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import knex, { Knex } from 'knex';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import * as fs from 'fs';

@Injectable()
export class KnexService implements OnModuleInit, OnModuleDestroy {
  private _knexInstance: Knex;

  constructor(private configService: ConfigService) {}

  get knex(): Knex {
    return this._knexInstance;
  }

  async onModuleInit() {
    const environment = this.configService.get('NODE_ENV') || 'development';

    // Find knexfile.js from the current working directory
    const knexfilePath = join(process.cwd(), 'knexfile.js');

    if (!fs.existsSync(knexfilePath)) {
      throw new Error(`Knexfile not found at ${knexfilePath}`);
    }

    // Import knexfile as ES module
    const knexModule = await import(knexfilePath);
    const knexConfig = knexModule.default;
    this._knexInstance = knex(knexConfig[environment]);
  }

  async onModuleDestroy() {
    await this._knexInstance.destroy();
  }

  // Helper methods for common database operations
  async findById(table: string, id: number) {
    return this._knexInstance(table).where({ id }).first();
  }

  async findOne(table: string, conditions: Record<string, any>) {
    return this._knexInstance(table).where(conditions).first();
  }

  async findMany(table: string, conditions: Record<string, any> = {}) {
    return this._knexInstance(table).where(conditions);
  }

  async findWithPagination(
    table: string,
    page: number = 1,
    limit: number = 10,
    conditions: Record<string, any> = {},
    orderBy: string = 'id',
    direction: 'asc' | 'desc' = 'asc',
  ) {
    const offset = (page - 1) * limit;

    const [count, data] = await Promise.all([
      this._knexInstance(table).where(conditions).count('* as count').first(),
      this._knexInstance(table)
        .where(conditions)
        .orderBy(orderBy, direction)
        .limit(limit)
        .offset(offset),
    ]);

    return {
      data,
      meta: {
        total: Number(count?.count || 0),
        page,
        limit,
      },
    };
  }

  async create(table: string, data: Record<string, any>) {
    const [id] = await this._knexInstance(table).insert(data).returning('id');
    return this.findById(table, id);
  }

  async update(table: string, id: number, data: Record<string, any>) {
    await this._knexInstance(table).where({ id }).update(data);
    return this.findById(table, id);
  }

  async delete(table: string, id: number) {
    return this._knexInstance(table).where({ id }).delete();
  }

  // Transaction helper
  async transaction<T>(
    callback: (trx: Knex.Transaction) => Promise<T>,
  ): Promise<T> {
    return this._knexInstance.transaction(callback);
  }
}
