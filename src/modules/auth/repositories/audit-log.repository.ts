import { Injectable } from '@nestjs/common';
import { AuditLog } from '../entities/audit-log.entity';
import { KnexBaseRepository } from '../../../common/repositories/knex-base.repository';
import { KnexService } from '../../../database/knex-service/knex.service';

@Injectable()
export class AuditLogRepository extends KnexBaseRepository<AuditLog> {
  constructor(knexService: KnexService) {
    super(knexService, 'audit_logs');
      }

  async getUserLogs(
    userId: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: AuditLog[]; meta: any }> {
    return this.findWithPagination(
        page,
        limit,
      { user_id: userId },
      'created_at',
      'desc',
      );
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
    return this.findWithPagination(
        page,
        limit,
      {
        user_id: userId,
        category: 'security',
      },
      'created_at',
      'desc',
    );
  }
}
