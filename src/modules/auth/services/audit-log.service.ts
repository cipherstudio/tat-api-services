import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog, AuditLogType } from '../entities/audit-log.entity';
import { Request } from 'express';
import { PaginatedResult } from '../../../common/interfaces/pagination.interface';
import { AuditLogRepository } from '../repositories/audit-log.repository';

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
    private readonly customAuditLogRepository: AuditLogRepository,
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

    // Use our custom repository for saving to handle CLOB and sequences
    return this.customAuditLogRepository.save(log);
  }

  async getUserLogs(
    userId: number,
    page = 1,
    limit = 10,
  ): Promise<PaginatedResult<AuditLog>> {
    // Use our Oracle-optimized custom repository
    return this.customAuditLogRepository.getUserLogs(userId, page, limit);
  }

  async getRecentFailedLogins(userId: number, minutes = 30): Promise<number> {
    // Use our Oracle-optimized custom repository
    return this.customAuditLogRepository.countRecentFailedLogins(
      userId,
      minutes,
    );
  }

  async getSecurityEvents(
    userId: number,
    page = 1,
    limit = 10,
  ): Promise<PaginatedResult<AuditLog>> {
    // Use our Oracle-optimized custom repository
    return this.customAuditLogRepository.getSecurityEvents(userId, page, limit);
  }
}
