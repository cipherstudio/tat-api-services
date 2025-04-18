import { Global, Module } from '@nestjs/common';
import { DATABASE_PROVIDERS } from './database.providers';

@Global()
@Module({
  providers: [...DATABASE_PROVIDERS],
  exports: [...DATABASE_PROVIDERS],
})
export class DatabaseModule {}
