import { User } from '../../users/entities/user.entity';

export enum AuditLogStatus {
  SUCCESS = 'success',
  FAILURE = 'failure',
}

export enum AuditLogCategory {
  AUTH = 'auth',
  USER = 'user',
  ADMIN = 'admin',
  SECURITY = 'security',
  GENERAL = 'general',
}

export interface AuditLog {
  id: number;
  employeeCode?: string;
  employeeName?: string;
  action: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  status: AuditLogStatus;
  category: AuditLogCategory;
  createdAt: Date;
}

// Snake case to camel case mapping for database results
export const auditLogColumnMap = {
  id: 'id',
  employee_code: 'employeeCode',
  employee_name: 'employeeName',
  action: 'action',
  details: 'details',
  ip_address: 'ipAddress',
  user_agent: 'userAgent',
  status: 'status',
  category: 'category',
  created_at: 'createdAt',
};

// Camel case to snake case mapping for database inserts
export const auditLogReverseColumnMap = {
  id: 'id',
  employeeCode: 'employee_code',
  employeeName: 'employee_name',
  action: 'action',
  details: 'details',
  ipAddress: 'ip_address',
  userAgent: 'user_agent',
  status: 'status',
  category: 'category',
  createdAt: 'created_at',
};
