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

  async findByToken(token: string): Promise<Session | undefined> {
    const dbSession = await this.findOne({ token });
    return dbSession ? await toCamelCase<Session>(dbSession) : undefined;
  }

  async findActiveSessionsByUserId(userId: number): Promise<Session[]> {
    const dbSessions = await this.find({
      user_id: userId,
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

  async deactivateAllUserSessions(userId: number): Promise<number> {
    const result = await this.knexService
      .knex('sessions')
      .where({ user_id: userId, is_active: true })
      .update({ is_active: false });

    return result;
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
