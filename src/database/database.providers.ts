import { Provider } from '@nestjs/common';
import { KnexService } from './knex-service/knex.service';
import { MssqlService } from './mssql-service/mssql.service';

export const DATABASE_PROVIDERS: Provider[] = [
  KnexService, // Oracle
  MssqlService, // MSSQL with pool + graceful shutdown
];

export { KnexService };
export { MssqlService };
