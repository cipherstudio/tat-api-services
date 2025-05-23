import {
  BasePaginationOptions,
  BaseFilterOptions,
  BaseIncludeOptions,
  BaseQueryOptions,
} from '../../../common/interfaces/query-options.interface';

/**
 * Places-specific filter options
 * @TypeProperty({
 *   category: 'interface',
 *   description: 'Filter options specific to places',
 *   extends: ['BaseFilterOptions']
 * })
 */
export interface PlacesFilterOptions extends BaseFilterOptions {
  /**
   * Filter by place name (partial match)
   * @TypeProperty({
   *   type: 'string',
   *   isOptional: true,
   *   description: 'Filter by place name (partial match)'
   * })
   */
  name?: string;
}

/**
 * Places-specific pagination options
 * @TypeProperty({
 *   category: 'interface',
 *   description: 'Pagination options specific to places',
 *   extends: ['BasePaginationOptions']
 * })
 */
export interface PlacesPaginationOptions extends BasePaginationOptions {}

/**
 * Places-specific include options
 * @TypeProperty({
 *   category: 'interface',
 *   description: 'Include options specific to places',
 *   extends: ['BaseIncludeOptions']
 * })
 */
export interface PlacesIncludeOptions extends BaseIncludeOptions {}

/**
 * Combined query options for places
 * @TypeProperty({
 *   category: 'interface',
 *   description: 'Combined query options for places',
 *   extends: ['BaseQueryOptions']
 * })
 */
export interface PlacesQueryOptions {
  page?: number;
  limit?: number;
  orderBy?: 'id' | 'name' | 'createdAt' | 'updatedAt';
  orderDir?: 'ASC' | 'DESC';
  name?: string;
  searchTerm?: string;
  createdAfter?: Date;
  createdBefore?: Date;
  updatedAfter?: Date;
  updatedBefore?: Date;
} 