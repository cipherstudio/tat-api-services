export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
}

export interface User {
  id: number;
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  refreshToken?: string;
  loginAttempts: number;
  lockUntil?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
  employeeCode?: string;
  employee?: import('../../dataviews/entities/employee.entity').Employee;
}

// Snake case to camel case mapping for database results
export const userColumnMap = {
  id: 'id',
  email: 'email',
  password: 'password',
  full_name: 'fullName',
  role: 'role',
  is_active: 'isActive',
  refresh_token: 'refreshToken',
  login_attempts: 'loginAttempts',
  lock_until: 'lockUntil',
  password_reset_token: 'passwordResetToken',
  password_reset_expires: 'passwordResetExpires',
  created_at: 'createdAt',
  updated_at: 'updatedAt',
  employee_code: 'employeeCode',
};

// Camel case to snake case mapping for database inserts
export const userReverseColumnMap = {
  id: 'id',
  email: 'email',
  password: 'password',
  fullName: 'full_name',
  role: 'role',
  isActive: 'is_active',
  refreshToken: 'refresh_token',
  loginAttempts: 'login_attempts',
  lockUntil: 'lock_until',
  passwordResetToken: 'password_reset_token',
  passwordResetExpires: 'password_reset_expires',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  employeeCode: 'employee_code',
};
