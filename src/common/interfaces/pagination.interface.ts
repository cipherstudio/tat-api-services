export interface PaginateOptions {
  page?: number;
  limit?: number;
  orderBy?: string;
  orderDir?: 'ASC' | 'DESC';
}

export interface QueryOptions {
  searchTerm?: string;
  filters?: Record<string, any>;
  includes?: string[];
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages?: number;
    lastPage: number;
  };
}
