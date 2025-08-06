import { Injectable } from '@nestjs/common';
import { Session } from '../entities/session.entity';
import { KnexBaseRepository } from '../../../common/repositories/knex-base.repository';
import { KnexService } from '../../../database/knex-service/knex.service';
import { toCamelCase, toSnakeCase } from '../../../common/utils/case-mapping';

@Injectable()
export class SessionRepository extends KnexBaseRepository<Session> {
  constructor(knexService: KnexService) {
    super(knexService, 'sessions');
  }

  async create(session: Partial<Session>): Promise<Session> {
    const dbSession = await toSnakeCase(session);
    const created = await this.knexService.create(this.tableName, dbSession);
    return await toCamelCase<Session>(created);
  }

  async update(id: number, session: Partial<Session>): Promise<Session> {
    const dbSession = await toSnakeCase(session);
    const updated = await super.update(id, dbSession);
    return await toCamelCase<Session>(updated);
  }

  async findActiveSessionsByEmployeeCode(
    employeeCode: string,
  ): Promise<Session[]> {
    const dbSessions = await this.find({
      employee_code: employeeCode,
      is_active: true,
    });
    return Promise.all(
      dbSessions.map(async (s) => await toCamelCase<Session>(s)),
    );
  }

  async findActiveSessionsByEmployeeName(
    employeeName: string,
  ): Promise<Session[]> {
    const dbSessions = await this.find({
      employee_name: employeeName,
      is_active: true,
    });
    return Promise.all(
      dbSessions.map(async (s) => await toCamelCase<Session>(s)),
    );
  }

  async findOne(conditions: Record<string, any>): Promise<Session | undefined> {
    const dbSession = await super.findOne(conditions);
    return dbSession ? await toCamelCase<Session>(dbSession) : undefined;
  }

  async find(conditions: Record<string, any> = {}): Promise<Session[]> {
    const dbSessions = await super.find(conditions);
    return Promise.all(
      dbSessions.map(async (s) => await toCamelCase<Session>(s)),
    );
  }

  async deactivateAllEmployeeSessions(employeeCode: string): Promise<number> {
    const result = await this.knexService
      .knex(this.tableName)
      .where('employee_code', employeeCode)
      .where('is_active', true)
      .update({ is_active: false });

    return result;
  }

  async deactivateAllEmployeeSessionsByName(
    employeeName: string,
  ): Promise<number> {
    const result = await this.knexService
      .knex(this.tableName)
      .where('employee_name', employeeName)
      .where('is_active', true)
      .update({ is_active: false });

    return result;
  }

  async getEmployeeActiveSessions(
    employeeCode: string,
  ): Promise<Session[]> {
    return this.findActiveSessionsByEmployeeCode(employeeCode);
  }

  async getEmployeeActiveSessionsByName(
    employeeName: string,
  ): Promise<Session[]> {
    return this.findActiveSessionsByEmployeeName(employeeName);
  }

  async cleanupExpiredSessions(): Promise<number> {
    const now = new Date();
    const result = await this.knexService
      .knex('sessions')
      .where('expires_at', '<', now)
      .update({ is_active: false });

    return result;
  }
}
