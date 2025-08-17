import { Injectable } from '@nestjs/common';
import { AuditLogStatus, AuditLogCategory } from '../entities/audit-log.entity';
import { AuditLogRepository } from '../repositories/audit-log.repository';

interface CreateLogParams {
  employeeCode?: string;
  employeeName?: string;
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
    employeeCode,
    employeeName,
    action,
    details,
    ipAddress,
    userAgent,
    status = AuditLogStatus.SUCCESS,
    category = AuditLogCategory.GENERAL,
  }: CreateLogParams) {
    const log = {
      employeeCode,
      employeeName,
      action,
      details: details ? JSON.stringify(details) : null,
      ipAddress,
      userAgent,
      status,
      category,
    };

    return this.auditLogRepository.create(log);
  }

  async getEmployeeLogs(employeeCode: string, page = 1, limit = 10) {
    return this.auditLogRepository.getEmployeeLogs(employeeCode, page, limit);
  }

  async countRecentFailedLogins(employeeCode: string, minutes = 30): Promise<number> {
    return this.auditLogRepository.countRecentFailedLogins(employeeCode, minutes);
  }

  async getSecurityEvents(employeeCode: string, page = 1, limit = 10) {
    return this.auditLogRepository.getSecurityEvents(employeeCode, page, limit);
  }

  async getEmployeeActivityLogs(employeeCode: string, page = 1, limit = 10) {
    return this.auditLogRepository.getEmployeeActivityLogs(employeeCode, page, limit);
  }
}
