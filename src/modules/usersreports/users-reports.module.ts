import { Module } from '@nestjs/common';
import { UsersReportsController } from './controllers/users-reports.controller';
import { UsersReportsService } from './services/users-reports.service';
import { UsersReportsRepository } from './repositories/users-reports.repository';
import { RedisCacheModule } from '../cache/redis-cache.module';
import { RedisCacheService } from '../cache/redis-cache.service';

@Module({
  imports: [RedisCacheModule],
  controllers: [UsersReportsController],
  providers: [
    UsersReportsService,
    UsersReportsRepository,
    RedisCacheService,
  ],
  exports: [UsersReportsService],
})
export class UsersReportsModule {} 