export interface OfficeDomesticQueryOptions {
  page?: number;
  limit?: number;
  name?: string;
  region?: string;
  isHeadOffice?: boolean;
  searchTerm?: string;
  orderBy?: string;
  orderDir?: 'asc' | 'desc';
  createdAfter?: Date;
  createdBefore?: Date;
  updatedAfter?: Date;
  updatedBefore?: Date;
}
