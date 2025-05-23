import {
  BasePaginationOptions,
  BaseFilterOptions,
  BaseIncludeOptions,
  BaseQueryOptions,
} from '../../../common/interfaces/query-options.interface';

/**
 * Provinces-specific filter options
 * @TypeProperty({
 *   category: 'interface',
 *   description: 'Filter options specific to provinces',
 *   extends: ['BaseFilterOptions']
 * })
 */
export interface ProvincesFilterOptions extends BaseFilterOptions {
  /**
   * Filter by province name in Thai (partial match)
   * @TypeProperty({
   *   type: 'string',
   *   isOptional: true,
   *   description: 'Filter by province name in Thai (partial match)'
   * })
   */
  nameTh?: string;

  /**
   * Filter by province name in English (partial match)
   * @TypeProperty({
   *   type: 'string',
   *   isOptional: true,
   *   description: 'Filter by province name in English (partial match)'
   * })
   */
  nameEn?: string;
}

/**
 * Provinces-specific pagination options
 * @TypeProperty({
 *   category: 'interface',
 *   description: 'Pagination options specific to provinces',
 *   extends: ['BasePaginationOptions']
 * })
 */
export interface ProvincesPaginationOptions extends BasePaginationOptions {}

/**
 * Provinces-specific include options
 * @TypeProperty({
 *   category: 'interface',
 *   description: 'Include options specific to provinces',
 *   extends: ['BaseIncludeOptions']
 * })
 */
export interface ProvincesIncludeOptions extends BaseIncludeOptions {}

/**
 * Combined query options for provinces
 * @TypeProperty({
 *   category: 'interface',
 *   description: 'Combined query options for provinces',
 *   extends: ['BaseQueryOptions']
 * })
 */
export interface ProvincesQueryOptions {
  page?: number;
  limit?: number;
  orderBy?: 'id' | 'nameTh' | 'nameEn' | 'createdAt' | 'updatedAt';
  orderDir?: 'ASC' | 'DESC';
  nameTh?: string;
  nameEn?: string;
  searchTerm?: string;
  createdAfter?: Date;
  createdBefore?: Date;
  updatedAfter?: Date;
  updatedBefore?: Date;
} 