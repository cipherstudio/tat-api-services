import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import knex, { Knex } from 'knex';

@Injectable()
export class MssqlService implements OnModuleInit, OnModuleDestroy {
  private _knexInstance: Knex | null = null;

  get knex(): Knex {
    if (!this._knexInstance) {
      throw new Error('MssqlService not initialized');
    }
    return this._knexInstance;
  }

  async onModuleInit() {
    this._knexInstance = knex({
      client: 'mssql',
      connection: {
        server: process.env.MSSQL_SERVER || 'host.docker.internal',
        port: parseInt(process.env.MSSQL_PORT || '1433', 10),
        user: process.env.MSSQL_USER || 'TATTRAS',
        password: process.env.MSSQL_PASSWORD || 'TRASPRD111',
        database: process.env.MSSQL_DATABASE || 'TAT-TA-TENANT',
        options: {
          encrypt: false,
          trustServerCertificate: true,
          enableArithAbort: true,
        },
      },
      pool: {
        min: 1,
        max: 10,
        acquireTimeoutMillis: 10000,
        idleTimeoutMillis: 30000,
        createTimeoutMillis: 10000,
        reapIntervalMillis: 1000,
        createRetryIntervalMillis: 200,
      },
    });

    this._knexInstance.client.pool.on('error', (err: any) => {
      console.error('MSSQL connection pool error:', err);
    });
  }

  async onModuleDestroy() {
    if (this._knexInstance) {
      await this._knexInstance.destroy();
      this._knexInstance = null;
    }
  }
}
