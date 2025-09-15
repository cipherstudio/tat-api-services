import { Injectable, Inject } from '@nestjs/common';
import { KnexBaseRepository } from '@common/repositories/knex-base.repository';
import { ReportCertificateExpense } from '../entities/report-certificate-expense.entity';
import { KnexService } from '../../../database/knex-service/knex.service';

@Injectable()
export class ReportCertificateExpenseRepository extends KnexBaseRepository<ReportCertificateExpense> {
  constructor(
    @Inject(KnexService) knexService: KnexService,
  ) {
    super(knexService, 'report_certificate_expenses');
  }

  async findByReportId(reportId: number): Promise<ReportCertificateExpense[]> {
    return this.knex(this.tableName)
      .where('report_certificate_id', reportId)
      .orderBy('display_order', 'asc')
      .orderBy('id', 'asc');
  }

  async deleteByReportId(reportId: number): Promise<void> {
    await this.knex(this.tableName)
      .where('report_certificate_id', reportId)
      .del();
  }

  async findOne(conditions: Record<string, any>): Promise<ReportCertificateExpense | undefined> {
    return this.knex(this.tableName)
      .where(conditions)
      .first();
  }
}
