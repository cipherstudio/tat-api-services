import {
  BasePaginationOptions,
  BaseFilterOptions,
  BaseIncludeOptions,
  BaseQueryOptions,
} from '../../../common/interfaces/query-options.interface';

/**
 * Countries-specific filter options
 * @TypeProperty({
 *   category: 'interface',
 *   description: 'Filter options specific to countries',
 *   extends: ['BaseFilterOptions']
 * })
 */
export interface CountriesFilterOptions extends BaseFilterOptions {
  /**
   * Filter by countries name (partial match)
   * @TypeProperty({
   *   type: 'string',
   *   isOptional: true,
   *   description: 'Filter by countries name (partial match)'
   * })
   */
  name?: string;
}

/**
 * Countries-specific pagination options
 * @TypeProperty({
 *   category: 'interface',
 *   description: 'Pagination options specific to countries',
 *   extends: ['BasePaginationOptions']
 * })
 */
export interface CountriesPaginationOptions extends BasePaginationOptions {
  /**
   * Whether to include inactive countriess in the results
   * @TypeProperty({
   *   type: 'boolean',
   *   isOptional: true,
   *   description: 'Whether to include inactive countriess in the results',
   *   defaultValue: false
   * })
   */
  includeInactive?: boolean;
}

/**
 * Countries-specific include options
 * @TypeProperty({
 *   category: 'interface',
 *   description: 'Include options specific to countries',
 *   extends: ['BaseIncludeOptions']
 * })
 */
export interface CountriesIncludeOptions extends BaseIncludeOptions {}

/**
 * Combined query options for countries
 * @TypeProperty({
 *   category: 'interface',
 *   description: 'Combined query options for countries',
 *   extends: ['BaseQueryOptions']
 * })
 */
export interface CountriesQueryOptions {
  page?: number;
  limit?: number;
  orderBy?: 'nameEn' | 'nameTh' | 'code' | 'id' | 'type' | 'percent_increase' | 'createdAt' | 'updatedAt';
  orderDir?: 'ASC' | 'DESC';
  nameEn?: string;
  nameTh?: string;
  code?: string;
  type?: string;
  searchTerm?: string;
  createdAfter?: Date;
  createdBefore?: Date;
  updatedAfter?: Date;
  updatedBefore?: Date;
}
