import { Injectable } from '@nestjs/common';
import { Session } from '../entities/session.entity';
import { SessionRepository } from '../repositories/session.repository';

@Injectable()
export class SessionService {
  constructor(private readonly sessionRepository: SessionRepository) {}

  async createSession(
    employeeCode: string,
    employeeName: string,
    token: string,
    deviceInfo?: string,
    ipAddress?: string,
    expiresIn: number = 24 * 60 * 60 * 1000, // Default 24 hours
  ): Promise<Session> {
    const expiresAt = new Date(Date.now() + expiresIn);

    const session = {
      employeeCode,
      employeeName,
      token,
      deviceInfo,
      ipAddress,
      isActive: true,
      expiresAt,
    };

    return this.sessionRepository.create(session);
  }

  async getSessionByToken(token: string): Promise<Session | undefined> {
    return this.sessionRepository.findOne({ token });
  }

  async getEmployeeActiveSessions(employeeCode: string): Promise<Session[]> {
    return this.sessionRepository.getEmployeeActiveSessions(employeeCode);
  }

  async getEmployeeActiveSessionsByName(
    employeeName: string,
  ): Promise<Session[]> {
    return this.sessionRepository.getEmployeeActiveSessionsByName(employeeName);
  }

  async deactivateAllEmployeeSessions(employeeCode: string): Promise<void> {
    await this.sessionRepository.deactivateAllEmployeeSessions(employeeCode);
  }

  async deactivateAllEmployeeSessionsByName(
    employeeName: string,
  ): Promise<void> {
    await this.sessionRepository.deactivateAllEmployeeSessionsByName(
      employeeName,
    );
  }

  async findSessionByToken(token: string): Promise<Session | undefined> {
    return this.sessionRepository.findOne({ token });
  }

  async deactivateSession(sessionId: number): Promise<void> {
    await this.sessionRepository.update(sessionId, { isActive: false });
  }

  async cleanupExpiredSessions(): Promise<number> {
    return this.sessionRepository.cleanupExpiredSessions();
  }
}
