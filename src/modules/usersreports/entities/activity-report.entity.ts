import { ApiProperty } from '@nestjs/swagger';

export interface ActivityReport {
  /**
   * The unique identifier for the session
   */
  id: number;

  /**
   * The employee code
   */
  employeeCode?: string;

  /**
   * The employee name
   */
  employeeName?: string;

  /**
   * The IP address
   */
  ipAddress?: string;

  /**
   * The user agent
   */
  userAgent?: string;

  /**
   * When the session was created
   */
  createdAt: Date;

  /**
   * When the session was last updated
   */
  updatedAt: Date;

  /**
   * When the session expires
   */
  expiresAt?: Date;

  /**
   * Whether the session is active
   */
  isActive?: boolean;
} 