import {
  BasePaginationOptions,
  BaseFilterOptions,
  BaseIncludeOptions,
  BaseQueryOptions,
} from '../../../common/interfaces/query-options.interface.js';

/**
 * Office international-specific filter options
 * @TypeProperty({
 *   category: 'interface',
 *   description: 'Filter options specific to office international',
 *   extends: ['BaseFilterOptions']
 * })
 */
export interface OfficeInternationalFilterOptions extends BaseFilterOptions {
  /**
   * Filter by office international name (partial match)
   * @TypeProperty({
   *   type: 'string',
   *   isOptional: true,
   *   description: 'Filter by office international name (partial match)'
   * })
   */
  name?: string;

  /**
   * Filter by office international region
   * @TypeProperty({
   *   type: 'string',
   *   isOptional: true,
   *   description: 'Filter by office international region'
   * })
   */
  region?: string;

  /**
   * Filter by country ID
   * @TypeProperty({
   *   type: 'number',
   *   isOptional: true,
   *   description: 'Filter by country ID'
   * })
   */
  countryId?: number;

  /**
   * Filter by currency ID
   * @TypeProperty({
   *   type: 'number',
   *   isOptional: true,
   *   description: 'Filter by currency ID'
   * })
   */
  currencyId?: number;

  /**
   * Filter by creation date after
   * @TypeProperty({
   *   type: 'Date',
   *   isOptional: true,
   *   description: 'Filter by creation date after'
   * })
   */
  createdAfter?: Date;

  /**
   * Filter by creation date before
   * @TypeProperty({
   *   type: 'Date',
   *   isOptional: true,
   *   description: 'Filter by creation date before'
   * })
   */
  createdBefore?: Date;

  /**
   * Filter by update date after
   * @TypeProperty({
   *   type: 'Date',
   *   isOptional: true,
   *   description: 'Filter by update date after'
   * })
   */
  updatedAfter?: Date;

  /**
   * Filter by update date before
   * @TypeProperty({
   *   type: 'Date',
   *   isOptional: true,
   *   description: 'Filter by update date before'
   * })
   */
  updatedBefore?: Date;
}

/**
 * Office international-specific pagination options
 * @TypeProperty({
 *   category: 'interface',
 *   description: 'Pagination options specific to office international',
 *   extends: ['BasePaginationOptions']
 * })
 */
export interface OfficeInternationalPaginationOptions extends BasePaginationOptions {}

/**
 * Office international-specific include options
 * @TypeProperty({
 *   category: 'interface',
 *   description: 'Include options specific to office international',
 *   extends: ['BaseIncludeOptions']
 * })
 */
export interface OfficeInternationalIncludeOptions extends BaseIncludeOptions {}

/**
 * Combined query options for office international
 * @TypeProperty({
 *   category: 'interface',
 *   description: 'Combined query options for office international',
 *   extends: ['BaseQueryOptions']
 * })
 */
export interface OfficeInternationalQueryOptions {
  page?: number;
  limit?: number;
  orderBy?: 'id' | 'name' | 'region' | 'pogCode' | 'countryId' | 'currencyId' | 'createdAt' | 'updatedAt';
  orderDir?: 'ASC' | 'DESC';
  name?: string;
  region?: string;
  pogCode?: string;
  countryId?: number;
  currencyId?: number;
  searchTerm?: string;
  createdAfter?: Date;
  createdBefore?: Date;
  updatedAfter?: Date;
  updatedBefore?: Date;
}
