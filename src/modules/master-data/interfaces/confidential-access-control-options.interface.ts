import { ConfidentialLevel } from '../entities/confidential-access-control.entity';

export interface ConfidentialAccessControlQueryOptions {
  page?: number;
  limit?: number;
  orderBy?: string;
  orderDir?: 'ASC' | 'DESC';
  position?: string;
  confidentialLevel?: ConfidentialLevel;
  searchTerm?: string;
  createdAfter?: Date;
  createdBefore?: Date;
  updatedAfter?: Date;
  updatedBefore?: Date;
} 