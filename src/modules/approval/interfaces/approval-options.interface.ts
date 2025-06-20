import {
  BasePaginationOptions,
  BaseFilterOptions,
  BaseIncludeOptions,
  BaseQueryOptions,
} from '../../../common/interfaces/query-options.interface';

/**
 * Approval-specific filter options
 * @TypeProperty({
 *   category: 'interface',
 *   description: 'Filter options specific to approval',
 *   extends: ['BaseFilterOptions']
 * })
 */
export interface ApprovalFilterOptions extends BaseFilterOptions {
  /**
   * Filter by approval name (partial match)
   * @TypeProperty({
   *   type: 'string',
   *   isOptional: true,
   *   description: 'Filter by approval name (partial match)'
   * })
   */
  name?: string;

  /**
   * Filter by latest approval status
   * @TypeProperty({
   *   type: 'string',
   *   isOptional: true,
   *   description: 'Filter by latest approval status'
   * })
   */
  latestApprovalStatus?: string;
}

/**
 * Approval-specific pagination options
 * @TypeProperty({
 *   category: 'interface',
 *   description: 'Pagination options specific to approval',
 *   extends: ['BasePaginationOptions']
 * })
 */
export interface ApprovalPaginationOptions extends BasePaginationOptions {
  /**
   * Whether to include inactive approvals in the results
   * @TypeProperty({
   *   type: 'boolean',
   *   isOptional: true,
   *   description: 'Whether to include inactive approvals in the results',
   *   defaultValue: false
   * })
   */
  includeInactive?: boolean;
}

/**
 * Approval-specific include options
 * @TypeProperty({
 *   category: 'interface',
 *   description: 'Include options specific to approval',
 *   extends: ['BaseIncludeOptions']
 * })
 */
export interface ApprovalIncludeOptions extends BaseIncludeOptions {}

/**
 * Combined query options for approval
 * @TypeProperty({
 *   category: 'interface',
 *   description: 'Combined query options for approval',
 *   extends: ['BaseQueryOptions']
 * })
 */
export interface ApprovalQueryOptions 
  extends ApprovalPaginationOptions,
    ApprovalFilterOptions,
    ApprovalIncludeOptions {}
