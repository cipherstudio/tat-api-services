import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum AuditLogType {
  LOGIN = 'login',
  LOGOUT = 'logout',
  PASSWORD_RESET = 'password_reset',
  PASSWORD_CHANGE = 'password_change',
  ACCOUNT_LOCK = 'account_lock',
  ACCOUNT_UNLOCK = 'account_unlock',
  SESSION_REVOKE = 'session_revoke',
}

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User, (user) => user.auditLogs)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'enum',
    enum: AuditLogType,
  })
  type: AuditLogType;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @Column({ name: 'ip_address' })
  ipAddress: string;

  @Column({ name: 'user_agent' })
  userAgent: string;

  @Column()
  success: boolean;

  @Column({ type: 'text', nullable: true })
  failureReason: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
