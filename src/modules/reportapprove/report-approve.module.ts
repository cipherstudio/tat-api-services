import { Module } from '@nestjs/common';
import { ReportApproveController } from './controllers/report-approve.controller';
import { ReportApproveService } from './services/report-approve.service';
import { ReportApproveRepository } from './repositories/report-approve.repository';
import { RedisCacheModule } from '../cache/redis-cache.module';
import { RedisCacheService } from '../cache/redis-cache.service';

@Module({
  imports: [RedisCacheModule],
  controllers: [ReportApproveController],
  providers: [ReportApproveService, ReportApproveRepository, RedisCacheService],
  exports: [ReportApproveService],
})
export class ReportApproveModule {}
