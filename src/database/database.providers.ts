import { Provider } from '@nestjs/common';
import { OracleService } from './oracle.service';

export const DATABASE_PROVIDERS: Provider[] = [OracleService];

export { OracleService };
