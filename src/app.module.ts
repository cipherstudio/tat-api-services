import { Module } from '@nestjs/common';
import { AppController } from './modules/app/app.controller';
import { AppService } from './modules/app/app.service';
import { ConfigModule } from './modules/config/config.module';
import { DatabaseModule as TypeOrmDatabaseModule } from './modules/config/database.module';
import { DatabaseModule } from './database/database.module';
import { LoggerModule } from './modules/logger/logger.module';
import { UsersModule } from './modules/users/users.module';
import { TypesModule } from './modules/types/types.module';
import { RedisCacheModule } from './modules/cache/redis-cache.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmDatabaseModule,
    DatabaseModule,
    LoggerModule,
    RedisCacheModule,
    UsersModule,
    TypesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
