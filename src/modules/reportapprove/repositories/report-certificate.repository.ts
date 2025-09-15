import { Injectable, Inject } from '@nestjs/common';
import { KnexBaseRepository } from '@common/repositories/knex-base.repository';
import { ReportCertificate } from '../entities/report-certificate.entity';
import { KnexService } from '../../../database/knex-service/knex.service';

@Injectable()
export class ReportCertificateRepository extends KnexBaseRepository<ReportCertificate> {
  constructor(
    @Inject(KnexService) knexService: KnexService,
  ) {
    super(knexService, 'report_certificate');
  }

  async findByEmployeeCode(employeeCode: string): Promise<ReportCertificate[]> {
    return this.knex(this.tableName)
      .where('employee_code', employeeCode)
      .whereNull('deleted_at')
      .orderBy('created_at', 'desc');
  }

  async findByDepartment(department: string): Promise<ReportCertificate[]> {
    return this.knex(this.tableName)
      .where('department', department)
      .whereNull('deleted_at')
      .orderBy('created_at', 'desc');
  }

  async findWithExpenses(id: number): Promise<any> {
    const certificate = await this.knex(this.tableName)
      .where('id', id)
      .whereNull('deleted_at')
      .first();

    if (!certificate) {
      return null;
    }

    const expenses = await this.knex('report_certificate_expenses')
      .where('report_certificate_id', id)
      .orderBy('display_order', 'asc')
      .orderBy('id', 'asc');

    return {
      ...certificate,
      expenses,
    };
  }

  async findOne(conditions: Record<string, any>): Promise<ReportCertificate | undefined> {
    return this.knex(this.tableName)
      .where(conditions)
      .whereNull('deleted_at')
      .first();
  }
}
