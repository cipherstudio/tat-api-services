import { Injectable } from '@nestjs/common';
import { AuditLogStatus, AuditLogCategory } from '../entities/audit-log.entity';
import { AuditLogRepository } from '../repositories/audit-log.repository';

interface CreateLogParams {
  userId?: number;
  action: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  status?: AuditLogStatus;
  category?: AuditLogCategory;
}

@Injectable()
export class AuditLogService {
  constructor(private readonly auditLogRepository: AuditLogRepository) {}

  async createLog({
    userId,
    action,
    details,
    ipAddress,
    userAgent,
    status = AuditLogStatus.SUCCESS,
    category = AuditLogCategory.GENERAL,
  }: CreateLogParams) {
    const log = {
      userId,
      action,
      details: details ? JSON.stringify(details) : null,
      ipAddress,
      userAgent,
      status,
      category,
    };

    return this.auditLogRepository.create(log);
  }

  async getUserLogs(userId: number, page = 1, limit = 10) {
    return this.auditLogRepository.getUserLogs(userId, page, limit);
  }

  async countRecentFailedLogins(userId: number, minutes = 30): Promise<number> {
    return this.auditLogRepository.countRecentFailedLogins(userId, minutes);
  }

  async getSecurityEvents(userId: number, page = 1, limit = 10) {
    return this.auditLogRepository.getSecurityEvents(userId, page, limit);
  }
}
