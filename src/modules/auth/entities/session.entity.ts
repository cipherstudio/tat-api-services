import { User } from '../../users/entities/user.entity';

export interface Session {
  id: number;
  userId: number;
  user?: User;
  employeeCode?: string;
  token: string;
  deviceInfo?: string;
  ipAddress?: string;
  isActive: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Snake case to camel case mapping for database results
export const sessionColumnMap = {
  id: 'id',
  user_id: 'userId',
  employee_code: 'employeeCode',
  token: 'token',
  device_info: 'deviceInfo',
  ip_address: 'ipAddress',
  is_active: 'isActive',
  expires_at: 'expiresAt',
  created_at: 'createdAt',
  updated_at: 'updatedAt',
};

// Camel case to snake case mapping for database inserts
export const sessionReverseColumnMap = {
  id: 'id',
  userId: 'user_id',
  employeeCode: 'employee_code',
  token: 'token',
  deviceInfo: 'device_info',
  ipAddress: 'ip_address',
  isActive: 'is_active',
  expiresAt: 'expires_at',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
};
