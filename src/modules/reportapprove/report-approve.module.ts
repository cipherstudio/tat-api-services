import { Module } from '@nestjs/common';
import { ReportApproveController } from './controllers/report-approve.controller';
import { ReportApproveService } from './services/report-approve.service';
import { ReportApproveRepository } from './repositories/report-approve.repository';
import { RedisCacheModule } from '../cache/redis-cache.module';
import { RedisCacheService } from '../cache/redis-cache.service';
import { ReportTravellerFormRepository } from './repositories/report-traveller-form.repository';
import { ReportDailyTravelDetailRepository } from './repositories/report-daily-travel-detail.repository';

@Module({
  imports: [RedisCacheModule],
  controllers: [ReportApproveController],
  providers: [
    ReportApproveService,
    ReportApproveRepository,
    RedisCacheService,
    ReportTravellerFormRepository,
    ReportDailyTravelDetailRepository,
  ],
  exports: [ReportApproveService],
})
export class ReportApproveModule {}
