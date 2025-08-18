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
import { ReportAllowanceRepository } from './repositories/report-allowance.repository';
import { ReportOtherExpenseListRepository } from './repositories/report-other-expense-list.repository';

// Entertainment Form Components
import { EntertainmentFormController } from './controllers/entertainment-form.controller';
import { EntertainmentFormService } from './services/entertainment-form.service';
import { ReportEntertainmentFormRepository } from './repositories/report-entertainment-form.repository';
import { ReportEntertainmentItemsRepository } from './repositories/report-entertainment-items.repository';
import { EntertainmentFormStatusRepository } from './repositories/entertainment-form-status.repository';

// Meeting Expense Report Components
import { MeetingExpenseReportController } from './controllers/meeting-expense-report.controller';
import { MeetingExpenseReportService } from './services/meeting-expense-report.service';
import { MeetingExpenseReportRepository } from './repositories/meeting-expense-report.repository';
import { MeetingTypeRepository } from './repositories/meeting-type.repository';
import { MeetingTypeRateRepository } from './repositories/meeting-type-rate.repository';

@Module({
  imports: [RedisCacheModule],
  controllers: [
    ReportApproveController,
    EntertainmentFormController,
    MeetingExpenseReportController,
  ],
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
    ReportAllowanceRepository,
    ReportOtherExpenseListRepository,

    // Entertainment Form Providers
    EntertainmentFormService,
    ReportEntertainmentFormRepository,
    ReportEntertainmentItemsRepository,
    EntertainmentFormStatusRepository,

    // Meeting Expense Report Providers
    MeetingExpenseReportService,
    MeetingExpenseReportRepository,
    MeetingTypeRepository,
    MeetingTypeRateRepository,
  ],
  exports: [
    ReportApproveService,
    EntertainmentFormService,
    MeetingExpenseReportService,
  ],
})
export class ReportApproveModule {}
