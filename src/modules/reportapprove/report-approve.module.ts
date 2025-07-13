import { Module } from '@nestjs/common';
import { ReportApproveController } from './controllers/report-approve.controller';
import { ReportApproveService } from './services/report-approve.service';
import { ReportApproveRepository } from './repositories/report-approve.repository';
import { RedisCacheModule } from '../cache/redis-cache.module';
import { RedisCacheService } from '../cache/redis-cache.service';
import { ReportTravellerFormRepository } from './repositories/report-traveller-form.repository';
import { ReportDailyTravelDetailRepository } from './repositories/report-daily-travel-detail.repository';
import { ReportHolidayWageDetailRepository } from './repositories/report-holiday-wage-detail.repository';
import { ReportAccommodationRepository } from './repositories/report-accommodation.repository';
import { ReportOtherExpenseRepository } from './repositories/report-other-expense.repository';
import { ReportTransportationRepository } from './repositories/report-transportation.repository';

@Module({
  imports: [RedisCacheModule],
  controllers: [ReportApproveController],
  providers: [
    ReportApproveService,
    ReportApproveRepository,
    RedisCacheService,
    ReportTravellerFormRepository,
    ReportDailyTravelDetailRepository,
    ReportHolidayWageDetailRepository,
    ReportAccommodationRepository,
    ReportOtherExpenseRepository,
    ReportTransportationRepository,
  ],
  exports: [ReportApproveService],
})
export class ReportApproveModule {}
