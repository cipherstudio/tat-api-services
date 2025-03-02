/**
 * Base options for pagination across all modules
 */
export interface BasePaginationOptions {
  page?: number;
  limit?: number;
  orderBy?: string;
  orderDir?: 'ASC' | 'DESC';
}

/**
 * Base options for filtering across all modules
 */
export interface BaseFilterOptions {
  isActive?: boolean;
  searchTerm?: string;
  createdAfter?: Date;
  createdBefore?: Date;
}

/**
 * Base options for including relations
 */
export interface BaseIncludeOptions {
  includes?: string[];
}

/**
 * Combined base options for querying
 */
export interface BaseQueryOptions
  extends BasePaginationOptions,
    BaseFilterOptions,
    BaseIncludeOptions {}
