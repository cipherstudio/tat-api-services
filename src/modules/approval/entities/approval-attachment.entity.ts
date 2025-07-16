export interface ApprovalAttachment {
  id: number;
  entityType: string;
  entityId: number;
  fileId: number;
  createdAt: Date;
  updatedAt: Date;
}

export const approvalAttachmentColumnMap = {
  id: 'id',
  entity_type: 'entityType',
  entity_id: 'entityId',
  file_id: 'fileId',
  created_at: 'createdAt',
  updated_at: 'updatedAt',
};

export const approvalAttachmentReverseColumnMap = {
  id: 'id',
  entityType: 'entity_type',
  entityId: 'entity_id',
  fileId: 'file_id',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
}; 