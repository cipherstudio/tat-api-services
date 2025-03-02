import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from '../entities/session.entity';
import { Request } from 'express';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
  ) {}

  async createSession(
    userId: number,
    refreshToken: string,
    req: Request,
  ): Promise<Session> {
    const session = this.sessionRepository.create({
      userId,
      refreshToken,
      userAgent: req.headers['user-agent'] || 'Unknown',
      ipAddress: req.ip,
    });

    return this.sessionRepository.save(session);
  }

  async findSessionByRefreshToken(refreshToken: string): Promise<Session> {
    return this.sessionRepository.findOne({
      where: { refreshToken, isActive: true },
    });
  }

  async deactivateSession(sessionId: number): Promise<void> {
    await this.sessionRepository.update(sessionId, { isActive: false });
  }

  async deactivateAllUserSessions(userId: number): Promise<void> {
    await this.sessionRepository.update(
      { userId, isActive: true },
      { isActive: false },
    );
  }

  async getUserActiveSessions(userId: number): Promise<Session[]> {
    return this.sessionRepository.find({
      where: { userId, isActive: true },
      order: { lastActivity: 'DESC' },
    });
  }

  async updateSessionActivity(sessionId: number): Promise<void> {
    await this.sessionRepository.update(sessionId, {
      lastActivity: new Date(),
    });
  }

  async cleanupInactiveSessions(daysOld: number = 30): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    await this.sessionRepository.delete({
      lastActivity: cutoffDate,
      isActive: false,
    });
  }
}
