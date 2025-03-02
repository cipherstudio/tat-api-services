import {
  BasePaginationOptions,
  BaseFilterOptions,
  BaseIncludeOptions,
} from '../../../common/interfaces/query-options.interface';
import { UserRole } from '../entities/user.entity';

/**
 * User-specific filter options
 * @TypeProperty({
 *   category: 'interface',
 *   description: 'Filter options specific to users',
 *   extends: ['BaseFilterOptions']
 * })
 */
export interface UserFilterOptions extends BaseFilterOptions {
  /**
   * Filter by user role
   * @TypeProperty({
   *   type: 'UserRole',
   *   isOptional: true,
   *   description: 'Filter by user role'
   * })
   */
  role?: UserRole;

  /**
   * Filter by email (partial match)
   * @TypeProperty({
   *   type: 'string',
   *   isOptional: true,
   *   description: 'Filter by email (partial match)'
   * })
   */
  email?: string;

  /**
   * Filter by full name (partial match)
   * @TypeProperty({
   *   type: 'string',
   *   isOptional: true,
   *   description: 'Filter by full name (partial match)'
   * })
   */
  fullName?: string;
}

/**
 * User-specific pagination options
 * @TypeProperty({
 *   category: 'interface',
 *   description: 'Pagination options specific to users',
 *   extends: ['BasePaginationOptions']
 * })
 */
export interface UserPaginationOptions extends BasePaginationOptions {
  /**
   * Whether to include inactive users in the results
   * @TypeProperty({
   *   type: 'boolean',
   *   isOptional: true,
   *   description: 'Whether to include inactive users in the results',
   *   defaultValue: false
   * })
   */
  includeInactive?: boolean;
}

/**
 * User-specific include options
 * @TypeProperty({
 *   category: 'interface',
 *   description: 'Include options specific to users',
 *   extends: ['BaseIncludeOptions']
 * })
 */
export interface UserIncludeOptions extends BaseIncludeOptions {}

/**
 * Combined query options for users
 * @TypeProperty({
 *   category: 'interface',
 *   description: 'Combined query options for users',
 *   extends: ['BaseQueryOptions']
 * })
 */
export interface UserQueryOptions
  extends UserPaginationOptions,
    UserFilterOptions,
    UserIncludeOptions {}
