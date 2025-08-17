import {
  BasePaginationOptions,
  BaseFilterOptions,
  BaseIncludeOptions,
} from '../../../common/interfaces/query-options.interface';

/**
 * Meet-rate-specific filter options
 */
export interface MeetRateFilterOptions extends BaseFilterOptions {
  /**
   * Filter by meeting type (partial match)
   */
  type?: string;
}

/**
 * Meet-rate-specific pagination options
 */
export interface MeetRatePaginationOptions extends BasePaginationOptions {}

/**
 * Meet-rate-specific include options
 */
export interface MeetRateIncludeOptions extends BaseIncludeOptions {}

/**
 * Combined query options for meet-rate
 */
export interface MeetRateQueryOptions {
  offset?: number;
  page?: number;
  limit?: number;
  orderBy?: string;
  orderDir?: 'asc' | 'desc';
  type?: string;
  searchTerm?: string;
  createdAfter?: Date;
  createdBefore?: Date;
  updatedAfter?: Date;
  updatedBefore?: Date;
}
