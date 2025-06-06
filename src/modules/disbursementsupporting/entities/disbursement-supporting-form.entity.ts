export interface DisbursementSupportingForm {
  id: number;
  documentTypeId: number;
  name: string;
  description?: string;
  remark?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const disbursementSupportingFormColumnMap = {
  id: 'id',
  document_type_id: 'documentTypeId',
  name: 'name',
  description: 'description',
  remark: 'remark',
  created_at: 'createdAt',
  updated_at: 'updatedAt',
};

export const disbursementSupportingFormReverseColumnMap = {
  id: 'id',
  documentTypeId: 'document_type_id',
  name: 'name',
  description: 'description',
  remark: 'remark',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
};
