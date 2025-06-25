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

  /**
   * Filter by increment ID (เลขที่หนังสือ)
   * @TypeProperty({
   *   type: 'string',
   *   isOptional: true,
   *   description: 'Filter by increment ID (เลขที่หนังสือ)'
   * })
   */
  incrementId?: string;

  /**
   * Filter by urgency level (ความด่วน)
   * @TypeProperty({
   *   type: 'string',
   *   isOptional: true,
   *   description: 'Filter by urgency level (ความด่วน)'
   * })
   */
  urgencyLevel?: string;

  /**
   * Filter by confidentiality level (ความลับ)
   * @TypeProperty({
   *   type: 'string',
   *   isOptional: true,
   *   description: 'Filter by confidentiality level (ความลับ)'
   * })
   */
  confidentialityLevel?: string;

  /**
   * Filter by document title (เรื่อง)
   * @TypeProperty({
   *   type: 'string',
   *   isOptional: true,
   *   description: 'Filter by document title (เรื่อง)'
   * })
   */
  documentTitle?: string;

  /**
   * Filter by approval request start date (วันที่ขออนุมัติเริ่มต้น)
   * @TypeProperty({
   *   type: 'string',
   *   isOptional: true,
   *   description: 'Filter by approval request start date (วันที่ขออนุมัติเริ่มต้น) - ISO date string (YYYY-MM-DD)'
   * })
   */
  approvalRequestStartDate?: string;

  /**
   * Filter by approval request end date (วันที่ขออนุมัติสิ้นสุด)
   * @TypeProperty({
   *   type: 'string',
   *   isOptional: true,
   *   description: 'Filter by approval request end date (วันที่ขออนุมัติสิ้นสุด) - ISO date string (YYYY-MM-DD)'
   * })
   */
  approvalRequestEndDate?: string;

  /**
   * Filter by whether the approval is related to the user
   * @TypeProperty({
   *   type: 'boolean',
   *   isOptional: true,
   *   description: 'Filter by whether the approval is related to the user'
   * })
   */
  isRelatedToMe?: boolean;
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
