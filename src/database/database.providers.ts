import { Provider } from '@nestjs/common';
import { KnexService } from './knex-service/knex.service';
import knex from 'knex';

export const DATABASE_PROVIDERS: Provider[] = [
  KnexService, // Oracle
  {
    provide: 'MSSQL_CONNECTION',
    useFactory: () => {
      return knex({
        client: 'mssql',
        connection: {
          server: process.env.MSSQL_SERVER || 'host.docker.internal',
          port: parseInt(process.env.MSSQL_PORT || '1433'),
          user: process.env.MSSQL_USER || 'TATTRAS',
          password: process.env.MSSQL_PASSWORD || 'TRASPRD111',
          database: process.env.MSSQL_DATABASE || 'TAT-TA-TENANT',
          options: {
            encrypt: false, // สำหรับ local network
            trustServerCertificate: true,
            enableArithAbort: true
          }
        }
      });
    }
  }
];

export { KnexService };
