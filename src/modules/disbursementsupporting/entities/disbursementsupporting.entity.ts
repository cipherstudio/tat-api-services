export interface DisbursementSupportingDocumentType {
  /**
   * The unique identifier for the disbursement supporting document type
   */
  id: number;

  /**
   * The name of the disbursement supporting document type
   */
  name: string;

  /**
   * The description of the disbursement supporting document type
   */
  description?: string;

  /**
   * When the disbursement supporting document type was created
   */
  createdAt: Date;

  /**
   * When the disbursement supporting document type was last updated
   */
  updatedAt: Date;
}

// Snake case to camel case mapping for database results
export const disbursementSupportingDocumentTypeColumnMap = {
  id: 'id',
  name: 'name',
  description: 'description',
  created_at: 'createdAt',
  updated_at: 'updatedAt',
};

// Camel case to snake case mapping for database inserts
export const disbursementSupportingDocumentTypeReverseColumnMap = {
  id: 'id',
  name: 'name',
  description: 'description',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
};
