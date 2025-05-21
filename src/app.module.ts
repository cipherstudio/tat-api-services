import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './modules/app/app.controller';
import { AppService } from './modules/app/app.service';
import { ConfigModule } from './modules/config/config.module';
import { DatabaseModule } from './database/database.module';
import { LoggerModule } from './modules/logger/logger.module';
import { UsersModule } from './modules/users/users.module';
import { TypesModule } from './modules/types/types.module';
import { RedisCacheModule } from './modules/cache/redis-cache.module';
import { RequestLoggerMiddleware } from './middleware/request-logger.middleware';
import { AuthModule } from './modules/auth/auth.module';
import { CountriesModule } from './modules/countries/countries.module';
import { PlacesModule } from './modules/places/places.module';
import { ExpensesOtherModule } from './modules/expenses-other/expenses-other.module';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    LoggerModule,
    RedisCacheModule,
    UsersModule,
    TypesModule,
    AuthModule,
    CountriesModule,
    PlacesModule,
    ExpensesOtherModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
