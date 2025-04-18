import { Injectable } from '@nestjs/common';
import { Session } from '../entities/session.entity';
import { SessionRepository } from '../repositories/session.repository';

@Injectable()
export class SessionService {
  constructor(private readonly sessionRepository: SessionRepository) {}

  async createSession(
    userId: number,
    token: string,
    deviceInfo?: string,
    ipAddress?: string,
    expiresIn: number = 24 * 60 * 60 * 1000, // Default 24 hours
  ): Promise<Session> {
    const expiresAt = new Date(Date.now() + expiresIn);

    const session = {
      userId,
      token,
      deviceInfo,
      ipAddress,
      isActive: true,
      expiresAt,
    };

    return this.sessionRepository.create(session);
  }

  async getSessionByToken(token: string): Promise<Session | undefined> {
    return this.sessionRepository.findByToken(token);
  }

  async deactivateSession(sessionId: number): Promise<void> {
    await this.sessionRepository.update(sessionId, { isActive: false });
  }

  async getUserActiveSessions(userId: number): Promise<Session[]> {
    return this.sessionRepository.findActiveSessionsByUserId(userId);
  }

  async deactivateAllUserSessions(userId: number): Promise<void> {
    await this.sessionRepository.deactivateAllUserSessions(userId);
  }

  async markSessionActive(sessionId: number, newToken: string): Promise<void> {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await this.sessionRepository.update(sessionId, {
      token: newToken,
      isActive: true,
      expiresAt,
    });
  }

  async cleanupExpiredSessions(): Promise<number> {
    return this.sessionRepository.cleanupExpiredSessions();
  }
}
