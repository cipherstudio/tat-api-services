import { Injectable } from '@nestjs/common';
import { DataSource, Repository, In } from 'typeorm';
import { AuditLog, AuditLogType } from '../entities/audit-log.entity';
import { OracleService } from '../../../database/oracle.service';
import { PaginatedResult } from '../../../common/interfaces/pagination.interface';
import { OracleHelper } from '../../../database/oracle-helper';

@Injectable()
export class AuditLogRepository extends Repository<AuditLog> {
  private readonly SEQ_NAME = 'AUDIT_LOG_ID_SEQ';

  constructor(
    private dataSource: DataSource,
    private oracleService: OracleService,
  ) {
    super(AuditLog, dataSource.createEntityManager());

    // Initialize sequence
    this.initSequence();
  }

  private async initSequence(): Promise<void> {
    await this.oracleService.createSequenceIfNotExists(this.SEQ_NAME);
  }

  /**
   * Override the save method to handle Oracle-specific behavior
   */
  async save<T extends AuditLog>(entity: T): Promise<T>;
  async save<T extends AuditLog>(entities: T[]): Promise<T[]>;
  async save<T extends AuditLog>(entityOrEntities: T | T[]): Promise<T | T[]> {
    // Handle single entity
    if (!Array.isArray(entityOrEntities)) {
      const entity = entityOrEntities;

      // If it's a new entity, get ID from the sequence
      if (!entity.id) {
        entity.id = await this.oracleService.getNextSequenceValue(
          this.SEQ_NAME,
        );
      }

      // Handle metadata CLOB field
      if (entity.metadata) {
        entity.metadata = OracleHelper.toJsonClob(entity.metadata) as any;
      }

      return super.save(entity);
    }

    // Handle array of entities
    const entities = entityOrEntities;
    for (const entity of entities) {
      if (!entity.id) {
        entity.id = await this.oracleService.getNextSequenceValue(
          this.SEQ_NAME,
        );
      }

      // Handle metadata CLOB field
      if (entity.metadata) {
        entity.metadata = OracleHelper.toJsonClob(entity.metadata) as any;
      }
    }

    return super.save(entities);
  }

  /**
   * Get user logs with Oracle-optimized pagination
   */
  async getUserLogs(
    userId: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResult<AuditLog>> {
    const queryParams: any[] = [];

    // Build the query
    const baseQuery = `
      SELECT id, user_id, type, metadata, ip_address, user_agent, success, failure_reason, created_at
      FROM audit_logs
      WHERE user_id = :0
      ORDER BY created_at DESC
    `;

    queryParams.push(userId);

    // Execute the query with Oracle pagination
    const [result, total] =
      await this.oracleService.executePaginatedQuery<AuditLog>(
        baseQuery,
        page,
        limit,
        queryParams,
      );

    // Map results to properly handle CLOB fields
    const mappedResults = result.map((log) => {
      if (typeof log.metadata === 'string') {
        return {
          ...log,
          metadata: OracleHelper.parseJsonClob(log.metadata),
        };
      }
      return log;
    });

    return {
      data: mappedResults,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
        limit,
      },
    };
  }

  /**
   * Get security events with Oracle-optimized pagination
   */
  async getSecurityEvents(
    userId: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResult<AuditLog>> {
    const queryParams: any[] = [];
    const securityEvents = [
      AuditLogType.PASSWORD_CHANGE,
      AuditLogType.PASSWORD_RESET,
      AuditLogType.TWO_FACTOR_ENABLE,
      AuditLogType.TWO_FACTOR_DISABLE,
      AuditLogType.ACCOUNT_LOCK,
      AuditLogType.ACCOUNT_UNLOCK,
    ];

    // Build IN clause for security events
    const eventsPlaceholders = securityEvents
      .map((_, index) => `:${index + 1}`)
      .join(', ');

    // Build the query
    const baseQuery = `
      SELECT id, user_id, type, metadata, ip_address, user_agent, success, failure_reason, created_at
      FROM audit_logs
      WHERE user_id = :0
      AND type IN (${eventsPlaceholders})
      ORDER BY created_at DESC
    `;

    queryParams.push(userId);
    securityEvents.forEach((event) => queryParams.push(event));

    // Execute the query with Oracle pagination
    const [result, total] =
      await this.oracleService.executePaginatedQuery<AuditLog>(
        baseQuery,
        page,
        limit,
        queryParams,
      );

    // Map results to properly handle CLOB fields
    const mappedResults = result.map((log) => {
      if (typeof log.metadata === 'string') {
        return {
          ...log,
          metadata: OracleHelper.parseJsonClob(log.metadata),
        };
      }
      return log;
    });

    return {
      data: mappedResults,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
        limit,
      },
    };
  }

  /**
   * Count recent failed logins
   */
  async countRecentFailedLogins(
    userId: number,
    minutes: number = 30,
  ): Promise<number> {
    const cutoffTimestamp = new Date();
    cutoffTimestamp.setMinutes(cutoffTimestamp.getMinutes() - minutes);

    const formattedDate = OracleHelper.formatDate(cutoffTimestamp);

    const query = `
      SELECT COUNT(*) as count
      FROM audit_logs
      WHERE user_id = :0
      AND type = :1
      AND success = :2
      AND created_at >= TO_TIMESTAMP(:3, 'YYYY-MM-DD"T"HH24:MI:SS.FF"Z"')
    `;

    const result = await this.dataSource.query(query, [
      userId,
      AuditLogType.LOGIN,
      0, // false in Oracle
      formattedDate,
    ]);

    return result[0]?.count || 0;
  }
}
