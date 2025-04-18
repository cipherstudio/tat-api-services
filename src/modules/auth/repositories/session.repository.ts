import { Injectable } from '@nestjs/common';
import { Session } from '../entities/session.entity';
import { KnexBaseRepository } from '../../../common/repositories/knex-base.repository';
import { KnexService } from '../../../database/knex-service/knex.service';

@Injectable()
export class SessionRepository extends KnexBaseRepository<Session> {
  constructor(knexService: KnexService) {
    super(knexService, 'sessions');
  }

  async findByToken(token: string): Promise<Session | undefined> {
    return this.findOne({ token });
  }

  async findActiveSessionsByUserId(userId: number): Promise<Session[]> {
    return this.find({
      user_id: userId,
      is_active: true,
    });
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
 