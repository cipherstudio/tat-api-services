import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import knex, { Knex } from 'knex';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import * as fs from 'fs';
import { isNaN } from 'lodash';

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
  async findById(
    table: string,
    id: number,
    orderBy: string = 'id',
    direction: 'asc' | 'desc' = 'asc',
  ) {
    return this._knexInstance(table)
      .where({ id })
      .orderBy(orderBy, direction)
      .first();
  }

  async findOne(
    table: string,
    conditions: Record<string, any>,
    orderBy: string = 'id',
    direction: 'asc' | 'desc' = 'asc',
  ) {
    return this._knexInstance(table)
      .where(conditions)
      .orderBy(orderBy, direction)
      .first();
  }

  async findMany(
    table: string,
    conditions: Record<string, any> = {},
    orderBy: string = 'id',
    direction: 'asc' | 'desc' = 'asc',
  ) {
    return this._knexInstance(table)
      .where(conditions)
      .orderBy(orderBy, direction);
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

  // Utility to sanitize data for Oracle/Knex
  private sanitizeData(data: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};
    Object.keys(data).forEach((key) => {
      let value = data[key];
      // Do NOT convert Date to string; let Oracle handle JS Date objects
      if (value === undefined) value = null;
      if (
        typeof value === 'object' &&
        value !== null &&
        !(value instanceof Date) &&
        !(value instanceof Buffer)
      ) {
        throw new Error(
          `Invalid value for key '${key}': Objects are not allowed as bind values. Value: ${JSON.stringify(value)}`,
        );
      }
      sanitized[key] = value;
    });
    return sanitized;
  }

  async create(table: string, data: Record<string, any>) {
    const sanitizedData = this.sanitizeData(data);
    let id;
    try {
      [id] = await this._knexInstance(table)
        .insert(sanitizedData)
        .returning('id');
    } catch (e) {
      await this._knexInstance(table).insert(sanitizedData);
      const result = await this._knexInstance(table)
        .select('id')
        .orderBy('id', 'desc')
        .first();
      id = result.id;
    }
    if (typeof id !== 'number') {
      // Try to extract id from object and convert to number
      if (id && typeof id.id === 'string' && !isNaN(Number(id.id))) {
        id = Number(id.id);
      } else if (id && typeof id.id === 'number') {
        id = id.id;
      } else {
        console.error('Invalid id returned from insert:', id);
        throw new Error(
          `Invalid id returned from insert: ${JSON.stringify(id)}`,
        );
      }
    }
    return this.findById(table, id);
  }

  async update(table: string, id: number, data: Record<string, any>) {
    const sanitizedData = this.sanitizeData(data);
    await this._knexInstance(table).where({ id }).update(sanitizedData);
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
