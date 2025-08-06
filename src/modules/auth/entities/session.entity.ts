import { User } from '../../users/entities/user.entity';

export interface Session {
  id: number;
  employeeCode?: string;
  employeeName?: string;
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
  employee_code: 'employeeCode',
  employee_name: 'employeeName',
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
  employeeCode: 'employee_code',
  employeeName: 'employee_name',
  token: 'token',
  deviceInfo: 'device_info',
  ipAddress: 'ip_address',
  isActive: 'is_active',
  expiresAt: 'expires_at',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
};
