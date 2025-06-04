export interface Files {
  /** The unique identifier for the files */
  id: number;
  /** The original name of the file */
  originalName: string;
  /** The file name stored in the system */
  fileName: string;
  /** The MIME type of the file */
  mimeType: string;
  /** The file size in bytes */
  size: number;
  /** The path where the file is stored */
  path: string;
  /** When the file was created */
  createdAt: Date;
  /** When the file was last updated */
  updatedAt: Date;
}

// Snake case to camel case mapping for database results
export const filesColumnMap = {
  id: 'id',
  original_name: 'originalName',
  file_name: 'fileName',
  mime_type: 'mimeType',
  size: 'size',
  path: 'path',
  created_at: 'createdAt',
  updated_at: 'updatedAt',
};

// Camel case to snake case mapping for database inserts
export const filesReverseColumnMap = {
  id: 'id',
  originalName: 'original_name',
  fileName: 'file_name',
  mimeType: 'mime_type',
  size: 'size',
  path: 'path',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
};
