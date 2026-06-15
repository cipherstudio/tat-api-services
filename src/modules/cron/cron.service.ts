import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { KnexService } from '../../database/knex-service/knex.service';
import { MssqlService } from '../../database/mssql-service/mssql.service';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(
    private readonly knexService: KnexService,
    private readonly mssqlService: MssqlService,
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

        const mssqlData = await this.mssqlService.knex
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
      const mssqlRecords = await this.mssqlService.knex
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

  /** +2 ปีตามปฏิทิน (UTC) แล้ว +1 วัน — ให้ตรงกับ approval.service calculateNextClaimDate */
  private calculateNextClaimDate(reportingDate: string): string {
    const s = String(reportingDate).trim();
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
    let baseUtc: Date;
    if (m) {
      baseUtc = new Date(
        Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])),
      );
    } else {
      const d = new Date(s);
      if (Number.isNaN(d.getTime())) {
        const reportingDateObj = new Date(reportingDate);
        const nextClaimDate = new Date(
          reportingDateObj.getTime() +
            2 * 365 * 24 * 60 * 60 * 1000 +
            24 * 60 * 60 * 1000,
        );
        return nextClaimDate.toISOString().split('T')[0];
      }
      baseUtc = new Date(
        Date.UTC(
          d.getUTCFullYear(),
          d.getUTCMonth(),
          d.getUTCDate(),
        ),
      );
    }
    const next = new Date(baseUtc.getTime());
    next.setUTCFullYear(next.getUTCFullYear() + 2);
    next.setUTCDate(next.getUTCDate() + 1);
    return next.toISOString().split('T')[0];
  }

  /**
   * #305 — เก็บ snapshot เงินเดือน + ค่าจ้างทำงานวันหยุด/ภาษี ของ "ปีงบเก่า"
   * รัน 30 ก.ย. ทุกปี (ก่อน 1 ต.ค. ที่ Oracle view จะปรับเป็นเงินเดือนปีงบใหม่)
   * เก็บแบบ 1 record/พนักงาน (update ทับของเดิม) → ไม่สะสมหลายปี DB ไม่บวม
   */
  @Cron('0 0 30 9 *')
  async snapshotOldFiscalYearSalary(): Promise<void> {
    this.logger.log('[OldFiscalYearSalary] snapshot start');
    try {
      const result = await this.runOldFiscalYearSnapshot();
      this.logger.log(
        `[OldFiscalYearSalary] snapshot done: ${JSON.stringify(result)}`,
      );
    } catch (error) {
      this.logger.error(
        '[OldFiscalYearSalary] snapshot error:',
        error instanceof Error ? error.stack : JSON.stringify(error),
      );
    }
  }

  /**
   * รัน snapshot ปีงบเก่า (เรียกได้ทั้งจาก cron และ endpoint ทดสอบ)
   * ระบุ employeeCodes เพื่อทำเฉพาะบางคน (สำหรับทดสอบ); ไม่ระบุ = ทุกคน
   */
  async runOldFiscalYearSnapshot(
    employeeCodes?: string[],
  ): Promise<{ processed: number; upserted: number; skipped: number }> {
    const knex = this.knexService.knex;
    // ปี พ.ศ. ของปีงบที่กำลังจะกลายเป็น "เก่า" (snapshot ก่อน 1 ต.ค.)
    const fiscalYear = new Date().getFullYear() + 543;

    let query = knex('OP_MASTER_T').select(
      knex.raw('RTRIM("PMT_CODE") as "code"'),
      knex.raw('"PMT_NAME_T" as "name"'),
      knex.raw('RTRIM("PMT_LEVEL_CODE") as "levelCode"'),
      knex.raw('RTRIM("PMT_SAL_CODE") as "salCode"'),
    );
    if (employeeCodes && employeeCodes.length > 0) {
      const codes = employeeCodes.map((c) => String(c).trim());
      const placeholders = codes.map(() => '?').join(', ');
      query = query.whereRaw(`RTRIM("PMT_CODE") IN (${placeholders})`, codes);
    }

    const employees: any[] = await query;
    let upserted = 0;
    let skipped = 0;

    for (const emp of employees) {
      try {
        const code = String(this.rowField(emp, 'code', 'CODE') ?? '').trim();
        if (!code) {
          skipped += 1;
          continue;
        }

        const salCodeRaw = this.rowField(emp, 'salCode', 'SALCODE');
        const salCodeNum =
          salCodeRaw != null && String(salCodeRaw).trim() !== ''
            ? Number(String(salCodeRaw).trim())
            : null;
        if (!salCodeNum || Number.isNaN(salCodeNum)) {
          skipped += 1;
          continue;
        }

        const salRow = (await knex('OP_LEVEL_SAL_R')
          .where('PLV_CODE', salCodeNum)
          .select('PLV_SALARY')
          .first()) as Record<string, unknown> | undefined;
        const salaryRaw = this.rowField(salRow, 'PLV_SALARY', 'plv_salary');
        const salary =
          salaryRaw != null && !Number.isNaN(Number(salaryRaw))
            ? Number(salaryRaw)
            : null;
        if (!salary || Number.isNaN(salary)) {
          skipped += 1;
          continue;
        }

        const rate = (await knex('holiday_work_rates')
          .where('salary', salary)
          .first()) as Record<string, unknown> | undefined;
        const rateId = this.rowField(rate, 'id', 'ID');
        if (rateId == null) {
          skipped += 1;
          continue;
        }

        const hours = (await knex('holiday_work_hours')
          .where('rate_id', rateId)
          .orderBy('hour', 'asc')) as Record<string, unknown>[];
        if (!hours || hours.length === 0) {
          skipped += 1;
          continue;
        }

        await this.upsertOldFiscalYearRecord({
          code,
          name: this.rowField(emp, 'name', 'NAME') as string | undefined,
          levelCode: this.rowField(emp, 'levelCode', 'LEVELCODE') as
            | string
            | undefined,
          salary,
          fiscalYear,
          hours: hours.map((h) => ({
            hour: Number(this.rowField(h, 'hour', 'HOUR')),
            workPay: Number(this.rowField(h, 'work_pay', 'WORK_PAY')),
            taxRate: Number(this.rowField(h, 'tax_rate', 'TAX_RATE')),
          })),
        });
        upserted += 1;
      } catch (error) {
        skipped += 1;
        this.logger.error(
          `[OldFiscalYearSalary] error employee ${this.rowField(emp, 'code', 'CODE') ?? '?'}:`,
          error instanceof Error ? error.stack : JSON.stringify(error),
        );
      }
    }

    return { processed: employees.length, upserted, skipped };
  }

  /** upsert 1 record/พนักงาน (update ทับ) + แทนที่ค่าจ้างวันหยุดรายชั่วโมงทั้งชุด */
  private async upsertOldFiscalYearRecord(rec: {
    code: string;
    name?: string;
    levelCode?: string;
    salary: number;
    fiscalYear: number;
    hours: { hour: number; workPay: number; taxRate: number }[];
  }): Promise<void> {
    const knex = this.knexService.knex;

    const existing = await knex('employee_old_fiscal_year_salary')
      .where('employee_code', rec.code)
      .first();

    let salaryId: number;
    if (existing) {
      salaryId = Number(this.rowField(existing, 'id', 'ID'));
      await knex('employee_old_fiscal_year_salary')
        .where('id', salaryId)
        .update({
          employee_name: rec.name ?? null,
          level_code: rec.levelCode ?? null,
          salary: rec.salary,
          fiscal_year: rec.fiscalYear,
          updated_at: new Date(),
        });
      await knex('employee_old_fiscal_year_holiday_hours')
        .where('salary_id', salaryId)
        .del();
    } else {
      await knex('employee_old_fiscal_year_salary').insert({
        employee_code: rec.code,
        employee_name: rec.name ?? null,
        level_code: rec.levelCode ?? null,
        salary: rec.salary,
        fiscal_year: rec.fiscalYear,
      });
      const inserted = await knex('employee_old_fiscal_year_salary')
        .where('employee_code', rec.code)
        .first();
      const insertedId = this.rowField(inserted, 'id', 'ID');
      if (insertedId == null) {
        throw new Error(
          `Failed to resolve salary record id for employee ${rec.code}`,
        );
      }
      salaryId = Number(insertedId);
    }

    const hourRows = rec.hours.map((h) => ({
      salary_id: salaryId,
      hour: h.hour,
      work_pay: h.workPay,
      tax_rate: h.taxRate,
    }));
    if (hourRows.length > 0) {
      await knex('employee_old_fiscal_year_holiday_hours').insert(hourRows);
    }
  }

  /** อ่านค่าจาก row ของ Oracle/Knex ที่ key อาจเป็น camelCase หรือ UPPER_CASE */
  private rowField(
    row: Record<string, unknown> | undefined | null,
    ...keys: string[]
  ): unknown {
    if (!row) return undefined;
    for (const key of keys) {
      if (row[key] !== undefined && row[key] !== null) return row[key];
      const upper = key.toUpperCase();
      if (row[upper] !== undefined && row[upper] !== null) return row[upper];
    }
    return undefined;
  }
}
