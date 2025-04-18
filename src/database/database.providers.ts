import { Provider } from '@nestjs/common';
import { KnexService } from './knex-service/knex.service';

export const DATABASE_PROVIDERS: Provider[] = [KnexService];

export { KnexService };
