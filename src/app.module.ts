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
import { MasterDataModule } from './modules/master-data/master-data.module';
import { DataviewsModule } from './modules/dataviews/dataviews.module';
import { FilesModule } from './modules/files/files.module';
import { DisbursementsupportingModule } from './modules/disbursementsupporting/disbursementsupporting.module';
import { ApprovalModule } from './modules/approval/approval.module';
import { ReportApproveModule } from './modules/reportapprove/report-approve.module';
import { NotificationModule } from './modules/notification/notification.module';
import { UsersReportsModule } from './modules/usersreports/users-reports.module';
import { LdapModule } from './modules/ldap/ldap.module';
import { CronModule } from './modules/cron/cron.module';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    LoggerModule,
    RedisCacheModule,
    UsersModule,
    TypesModule,
    AuthModule,
    MasterDataModule,
    DataviewsModule,
    FilesModule,
    DisbursementsupportingModule,
    ApprovalModule,
    ReportApproveModule,
    NotificationModule,
    UsersReportsModule,
    LdapModule,
    CronModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
