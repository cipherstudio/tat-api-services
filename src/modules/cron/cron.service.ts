import { Injectable, Logger, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { KnexService } from '../../database/knex-service/knex.service';
import { Knex } from 'knex';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(
    private readonly knexService: KnexService,
    @Inject('MSSQL_CONNECTION') private readonly mssqlConnection: Knex,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailyTask() {
    this.logger.log('Cron job running');

    try {
      await this.copyReportDate();

      this.logger.log('Cron job completed');
    } catch (error) {
      this.logger.error('Cron job error:', error);
    }
  }

  private async copyReportDate(): Promise<void> {
    this.logger.log('Copying report date from MSSQL');

    // หา rows ที่ยังไม่มี reporting_date
    const pendingExpenses = await this.knexService
      .knex('approval_clothing_expense')
      .whereNull('reporting_date')
      .select('id', 'employee_code', 'work_start_date');

    if (!pendingExpenses || pendingExpenses.length === 0) {
      this.logger.log('No clothing expenses pending reporting_date');
      return;
    }

    this.logger.log(
      `Found ${pendingExpenses.length} expenses pending reporting_date`,
    );

    let updatedCount = 0;

    for (const expense of pendingExpenses) {
      try {
        // หาวันรายงานตัวจาก MSSQL ViewDutyFormCommands

        const mssqlData = await this.mssqlConnection
          .select('*')
          .from('ViewDutyFormCommands')
          .where('EmployeeId', expense.employee_code)
          .first();

        if (mssqlData) {
          const reportingDate =
            mssqlData.DutyReportTime || mssqlData.ArrivedDate;

          if (reportingDate) {
            const formattedDate = new Date(reportingDate)
              .toISOString()
              .split('T')[0];

            // อัปเดตค่า reporting_date
            await this.knexService
              .knex('approval_clothing_expense')
              .where('id', expense.id)
              .update({
                reporting_date: formattedDate,
                updated_at: new Date(),
              });

            updatedCount += 1;
          }
        }
      } catch (error) {
        this.logger.error(
          `Error processing expense ${expense.id} for employee ${expense.employee_code}:`,
          error.message,
        );
      }
    }

    this.logger.log(`Updated reporting_date for ${updatedCount} records`);
  }
}
