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

    await this.updateExistingRecords();

    await this.createNewRecordsFromMSSQL();
  }

  private async updateExistingRecords(): Promise<void> {
    this.logger.log('[Update Existing] Starting to update existing records');

    const pendingExpenses = await this.knexService
      .knex('approval_clothing_expense')
      .whereNull('reporting_date')
      .whereNull('next_claim_date')
      .select('id', 'employee_code');

    if (!pendingExpenses || pendingExpenses.length === 0) {
      this.logger.log('[Update Existing] No clothing expenses pending reporting_date');
      return;
    }

    this.logger.log(
      `[Update Existing] Found ${pendingExpenses.length} expenses pending reporting_date`,
    );

    let updatedCount = 0;
    let nextClaimDateCalculatedCount = 0;

    for (const expense of pendingExpenses) {
      try {
        const employeeCodeStr = String(expense.employee_code);
        
        this.logger.log(
          `[Update Existing] Querying MSSQL for Employee ${employeeCodeStr} (Expense ID: ${expense.id})`,
        );

        const mssqlData = await this.mssqlConnection
          .select('*')
          .from('ViewDutyFormCommands')
          .where('EmployeeId', employeeCodeStr)
          .first();

        if (mssqlData && mssqlData.DutyReportTime) {
          const reportingDate = mssqlData.DutyReportTime;
          const formattedDate = new Date(reportingDate)
            .toISOString()
            .split('T')[0];

          this.logger.log(
            `[Update Existing] Found DutyReportTime for Employee ${employeeCodeStr}: ${formattedDate}`,
          );

          const nextClaimDate = this.calculateNextClaimDate(formattedDate);
          nextClaimDateCalculatedCount += 1;

          await this.knexService
            .knex('approval_clothing_expense')
            .where('id', expense.id)
            .update({
              reporting_date: formattedDate,
              next_claim_date: nextClaimDate,
              updated_at: new Date(),
            });

          updatedCount += 1;
        } else {
          this.logger.warn(
            `[Update Existing] No DutyReportTime found for Employee ${employeeCodeStr} (Expense ID: ${expense.id})`,
          );
        }
      } catch (error) {
        this.logger.error(
          `[Update Existing] Error processing expense ${expense.id} for employee ${expense.employee_code}:`,
          error instanceof Error ? error.stack : JSON.stringify(error),
        );
      }
    }

    this.logger.log(`[Update Existing] Updated reporting_date for ${updatedCount} records`);
    this.logger.log(
      `[Update Existing] Calculated next_claim_date for ${nextClaimDateCalculatedCount} records`,
    );
  }

  private async createNewRecordsFromMSSQL(): Promise<void> {
    this.logger.log('[Create New] Starting to create new records from MSSQL');

    try {
      const mssqlRecords = await this.mssqlConnection
        .select('*')
        .from('ViewDutyFormCommands')
        .whereNotNull('DutyReportTime');

      this.logger.log(
        `[Create New] Found ${mssqlRecords.length} records with DutyReportTime in MSSQL`,
      );

      let createdCount = 0;
      let skippedCount = 0;

      for (const mssqlData of mssqlRecords) {
        try {
          const employeeCode = parseInt(mssqlData.EmployeeId);
          const commandId = String(mssqlData.CommandId);
          const reportingDate = mssqlData.DutyReportTime;
          const formattedReportingDate = new Date(reportingDate)
            .toISOString()
            .split('T')[0];

          if (!employeeCode || !commandId || !reportingDate) {
            this.logger.warn(
              `[Create New] Skipping record with missing data: EmployeeId=${mssqlData.EmployeeId}, CommandId=${mssqlData.CommandId}, DutyReportTime=${reportingDate}`,
            );
            continue;
          }

          const existing = await this.knexService
            .knex('approval_clothing_expense')
            .where('employee_code', employeeCode)
            .where(function() {
              this.where('increment_id', commandId).orWhere(
                'reporting_date',
                formattedReportingDate,
              );
            })
            .first();

          if (existing) {
            this.logger.log(
              `[Create New] Record already exists for Employee ${employeeCode}, CommandId ${commandId}, skipping`,
            );
            skippedCount += 1;
            continue;
          }

          const nextClaimDate = this.calculateNextClaimDate(
            formattedReportingDate,
          );

          await this.knexService.knex('approval_clothing_expense').insert({
            employee_code: employeeCode,
            increment_id: commandId,
            reporting_date: formattedReportingDate,
            next_claim_date: nextClaimDate,
            clothing_file_checked: false,
            created_at: new Date(),
            updated_at: new Date(),
          });

          this.logger.log(
            `[Create New] Created new record for Employee ${employeeCode}, CommandId ${commandId}, reporting_date ${formattedReportingDate}`,
          );
          createdCount += 1;
        } catch (error) {
          this.logger.error(
            `[Create New] Error processing MSSQL record:`,
            error instanceof Error ? error.stack : JSON.stringify(error),
          );
        }
      }

      this.logger.log(`[Create New] Created ${createdCount} new records`);
      this.logger.log(`[Create New] Skipped ${skippedCount} existing records`);
    } catch (error) {
      this.logger.error(
        `[Create New] Error querying MSSQL:`,
        error instanceof Error ? error.stack : JSON.stringify(error),
      );
    }
  }

  private calculateNextClaimDate(reportingDate: string): string {
    //  next_claim_date = (reportingDate + 2 ปี + 1 วัน )
    const reportingDateObj = new Date(reportingDate);
    const nextClaimDate = new Date(
      reportingDateObj.getTime() +
        2 * 365 * 24 * 60 * 60 * 1000 +
        24 * 60 * 60 * 1000,
    );
    return nextClaimDate.toISOString().split('T')[0];
  }
}
