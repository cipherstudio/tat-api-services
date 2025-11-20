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

    // Add error handling for connection issues
    this._knexInstance.on('query-error', (error, obj) => {
      // Handle connection reset errors gracefully
      if (error.code === 'ECONNRESET' || error.errno === -104) {
        console.warn(
          'Database connection reset during query (will retry):',
          error.message,
        );
        console.warn('Query:', obj.sql);
        // Don't log as error - connection resets are recoverable
        return;
      }

      console.error('Database query error:', error);
      console.error('Query:', obj.sql);
      console.error('Bindings:', obj.bindings);
    });

    // Handle connection pool errors
    this._knexInstance.client.pool.on('error', (error: any) => {
      // Handle connection reset errors in pool gracefully
      if (error.code === 'ECONNRESET' || error.errno === -104) {
        console.warn(
          'Database connection pool reset (will reconnect):',
          error.message,
        );
        // Connection pool will automatically recreate connections
        return;
      }
      console.error('Database connection pool error:', error);
    });

    // Handle connection pool acquire errors (when getting connection from pool)
    this._knexInstance.client.pool.on(
      'acquireRequestTimeout',
      (timeout: any) => {
        console.warn(
          'Database connection pool acquire timeout - pool may be exhausted',
        );
      },
    );

    // Handle connection pool creation errors
    this._knexInstance.client.pool.on('createError', (error: any) => {
      if (error.code === 'ECONNRESET' || error.errno === -104) {
        console.warn(
          'Database connection creation failed (will retry):',
          error.message,
        );
        // Pool will retry based on createRetryIntervalMillis
        return;
      }
      console.error('Database connection creation error:', error);
    });

    // Test connection on startup
    try {
      await this._knexInstance.raw('SELECT 1 FROM DUAL');
      console.log('Database connection established successfully');
    } catch (error) {
      console.error('Failed to establish database connection:', error);
      throw error;
    }
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

  async delete(table: string, id: number, primaryKey: string = 'id') {
    return this._knexInstance(table)
      .where({ [primaryKey]: id })
      .delete();
  }

  // Transaction helper
  async transaction<T>(
    callback: (trx: Knex.Transaction) => Promise<T>,
  ): Promise<T> {
    return this._knexInstance.transaction(callback);
  }

  // Retry logic for database operations
  private async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000,
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        // Check if it's a connection error that should be retried
        if (this.isRetryableError(error) && attempt < maxRetries) {
          console.warn(
            `Database operation failed (attempt ${attempt}/${maxRetries}), retrying in ${delay}ms...`,
            error.message,
          );
          await new Promise((resolve) => setTimeout(resolve, delay * attempt));
          continue;
        }

        throw error;
      }
    }

    throw lastError;
  }

  // Check if error is retryable
  private isRetryableError(error: any): boolean {
    if (!error) return false;

    const retryableErrors = [
      'ECONNRESET',
      'ECONNREFUSED',
      'ETIMEDOUT',
      'ENOTFOUND',
      'ECONNABORTED',
      'EPIPE',
      'ORA-03113', // Oracle connection lost
      'ORA-03114', // Oracle not connected
      'ORA-12541', // Oracle listener not available
      'ORA-12535', // Oracle timeout
    ];

    return retryableErrors.some(
      (errCode) =>
        error.code === errCode ||
        error.message?.includes(errCode) ||
        error.errno === -104, // ECONNRESET
    );
  }

  // Wrapper methods with retry logic
  async findByIdWithRetry(
    table: string,
    id: number,
    orderBy: string = 'id',
    direction: 'asc' | 'desc' = 'asc',
  ) {
    return this.withRetry(() => this.findById(table, id, orderBy, direction));
  }

  async findOneWithRetry(
    table: string,
    conditions: Record<string, any>,
    orderBy: string = 'id',
    direction: 'asc' | 'desc' = 'asc',
  ) {
    return this.withRetry(() =>
      this.findOne(table, conditions, orderBy, direction),
    );
  }

  async findManyWithRetry(
    table: string,
    conditions: Record<string, any> = {},
    orderBy: string = 'id',
    direction: 'asc' | 'desc' = 'asc',
  ) {
    return this.withRetry(() =>
      this.findMany(table, conditions, orderBy, direction),
    );
  }
}
