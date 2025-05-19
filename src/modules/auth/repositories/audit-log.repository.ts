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

  async getUserLogs(
    userId: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: AuditLog[]; meta: any }> {
    const result = await this.findWithPagination(
      page,
      limit,
      { user_id: userId },
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
    userId: number,
    minutes: number = 30,
  ): Promise<number> {
    const timeThreshold = new Date();
    timeThreshold.setMinutes(timeThreshold.getMinutes() - minutes);

    const result = await this.knexService
      .knex('audit_logs')
      .where({
        user_id: userId,
        action: 'LOGIN_FAILED',
        status: 'failure',
      })
      .where('created_at', '>=', timeThreshold)
      .count('* as count')
      .first();

    return Number(result?.count || 0);
  }

  async getSecurityEvents(
    userId: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: AuditLog[]; meta: any }> {
    const result = await this.findWithPagination(
      page,
      limit,
      {
        user_id: userId,
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
}
