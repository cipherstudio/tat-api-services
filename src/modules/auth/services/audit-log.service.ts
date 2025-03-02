import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { AuditLog, AuditLogType } from '../entities/audit-log.entity';
import { Request } from 'express';

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async log(
    userId: number,
    type: AuditLogType,
    req: Request,
    success = true,
    metadata?: Record<string, any>,
    failureReason?: string,
  ): Promise<AuditLog> {
    const log = this.auditLogRepository.create({
      userId,
      type,
      metadata,
      success,
      failureReason,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || 'Unknown',
    });

    return this.auditLogRepository.save(log);
  }

  async getUserLogs(
    userId: number,
    page = 1,
    limit = 10,
  ): Promise<[AuditLog[], number]> {
    return this.auditLogRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async getRecentFailedLogins(userId: number, minutes = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setMinutes(cutoffDate.getMinutes() - minutes);

    return this.auditLogRepository.count({
      where: {
        userId,
        type: AuditLogType.LOGIN,
        success: false,
        createdAt: cutoffDate,
      },
    });
  }

  async getSecurityEvents(
    userId: number,
    page = 1,
    limit = 10,
  ): Promise<[AuditLog[], number]> {
    const securityEvents = [
      AuditLogType.PASSWORD_CHANGE,
      AuditLogType.PASSWORD_RESET,
      AuditLogType.TWO_FACTOR_ENABLE,
      AuditLogType.TWO_FACTOR_DISABLE,
      AuditLogType.ACCOUNT_LOCK,
      AuditLogType.ACCOUNT_UNLOCK,
    ];

    return this.auditLogRepository.findAndCount({
      where: {
        userId,
        type: In(securityEvents),
      },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }
}
