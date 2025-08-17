import {
  BasePaginationOptions,
  BaseFilterOptions,
  BaseIncludeOptions,
  // BaseQueryOptions,
} from '../../../common/interfaces/query-options.interface';

/**
 * Expenses-other-specific filter options
 * @TypeProperty({
 *   category: 'interface',
 *   description: 'Filter options specific to expenses-other',
 *   extends: ['BaseFilterOptions']
 * })
 */
export interface ExpensesOtherFilterOptions extends BaseFilterOptions {
  /**
   * Filter by expenses-other name (partial match)
   * @TypeProperty({
   *   type: 'string',
   *   isOptional: true,
   *   description: 'Filter by expenses-other name (partial match)'
   * })
   */
  name?: string;
}

/**
 * Expenses-other-specific pagination options
 * @TypeProperty({
 *   category: 'interface',
 *   description: 'Pagination options specific to expenses-other',
 *   extends: ['BasePaginationOptions']
 * })
 */
export interface ExpensesOtherPaginationOptions extends BasePaginationOptions {}

/**
 * Expenses-other-specific include options
 * @TypeProperty({
 *   category: 'interface',
 *   description: 'Include options specific to expenses-other',
 *   extends: ['BaseIncludeOptions']
 * })
 */
export interface ExpensesOtherIncludeOptions extends BaseIncludeOptions {}

/**
 * Combined query options for expenses-other
 * @TypeProperty({
 *   category: 'interface',
 *   description: 'Combined query options for expenses-other',
 *   extends: ['BaseQueryOptions']
 * })
 */
export interface ExpensesOtherQueryOptions {
  offset?: number;
  page?: number;
  limit?: number;
  orderBy?: string;
  orderDir?: 'asc' | 'desc';
  name?: string;
  searchTerm?: string;
  createdAfter?: Date;
  createdBefore?: Date;
  updatedAfter?: Date;
  updatedBefore?: Date;
}
