export enum NotificationType {
  APPROVAL_CREATED = 'approval_created',
  APPROVAL_UPDATED = 'approval_updated',
  APPROVAL_APPROVED = 'approval_approved',
  APPROVAL_REJECTED = 'approval_rejected',
  REPORT_CREATED = 'report_created',
  REPORT_UPDATED = 'report_updated',
  REPORT_APPROVED = 'report_approved',
  REPORT_REJECTED = 'report_rejected',
}

export enum EntityType {
  APPROVAL = 'approval',
  REPORT = 'report',
}

export interface Notification {
  id: number;
  employeeCode: string; // employee_code ที่เชื่อมต่อกับ OP_MASTER_T
  title: string;
  message: string;
  type: NotificationType;
  entityType: EntityType;
  entityId: number;
  metadata?: Record<string, any> | string; // Support both object and JSON string for Oracle DB
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Snake case to camel case mapping for database results
export const notificationColumnMap = {
  id: 'id',
  employee_code: 'employeeCode',
  title: 'title',
  message: 'message',
  type: 'type',
  entity_type: 'entityType',
  entity_id: 'entityId',
  metadata: 'metadata',
  is_read: 'isRead',
  read_at: 'readAt',
  created_at: 'createdAt',
  updated_at: 'updatedAt',
};

// Camel case to snake case mapping for database inserts
export const notificationReverseColumnMap = {
  id: 'id',
  employeeCode: 'employee_code',
  title: 'title',
  message: 'message',
  type: 'type',
  entityType: 'entity_type',
  entityId: 'entity_id',
  metadata: 'metadata',
  isRead: 'is_read',
  readAt: 'read_at',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
};
