import { Injectable } from '@nestjs/common';
import { AuditLog } from '../entities/audit-log.entity';
import { KnexBaseRepository } from '../../../common/repositories/knex-base.repository';
import { KnexService } from '../../../database/knex-service/knex.service';
import { toCamelCase, toSnakeCase } from '../../../common/utils/case-mapping';

@Injectable()
export class AuditLogRepository extends KnexBaseRepository<AuditLog> {
  constructor(knexService: KnexService) {
    super(knexService, 'audit_logs');
  }

  async create(auditLog: Partial<AuditLog>): Promise<AuditLog> {
    const dbAuditLog = await toSnakeCase(auditLog);
    const created = await super.create(dbAuditLog);
    return await toCamelCase<AuditLog>(created);
  }

  async update(id: number, auditLog: Partial<AuditLog>): Promise<AuditLog> {
    const dbAuditLog = await toSnakeCase(auditLog);
    const updated = await super.update(id, dbAuditLog);
    return await toCamelCase<AuditLog>(updated);
  }

  async getEmployeeLogs(
    employeeCode: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: AuditLog[]; meta: any }> {
    const result = await this.findWithPagination(
      page,
      limit,
      { employee_code: employeeCode },
      'created_at',
      'desc',
    );
    return {
      ...result,
      data: await Promise.all(
        result.data.map(async (l) => await toCamelCase<AuditLog>(l)),
      ),
    };
  }

  async countRecentFailedLogins(
    employeeCode: string,
    minutes = 30,
  ): Promise<number> {
    const timeAgo = new Date(Date.now() - minutes * 60 * 1000);
    const result = await this.knexService
      .knex(this.tableName)
      .where('employee_code', employeeCode)
      .where('status', 'failure')
      .where('category', 'auth')
      .where('created_at', '>=', timeAgo)
      .count('* as count')
      .first();

    return result ? parseInt(result.count as string) : 0;
  }

  async getSecurityEvents(
    employeeCode: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: AuditLog[]; meta: any }> {
    const result = await this.findWithPagination(
      page,
      limit,
      {
        employee_code: employeeCode,
        category: 'security',
      },
      'created_at',
      'desc',
    );
    return {
      ...result,
      data: await Promise.all(
        result.data.map(async (l) => await toCamelCase<AuditLog>(l)),
      ),
    };
  }

  async getEmployeeActivityLogs(
    employeeCode: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: AuditLog[]; meta: any }> {
    const result = await this.findWithPagination(
      page,
      limit,
      { employee_code: employeeCode },
      'created_at',
      'desc',
    );
    return {
      ...result,
      data: await Promise.all(
        result.data.map(async (l) => await toCamelCase<AuditLog>(l)),
      ),
    };
  }
}
