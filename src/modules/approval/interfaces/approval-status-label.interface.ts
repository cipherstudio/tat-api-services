import { ApprovalStatusLabel } from '../entities/approval-status-label.entity';

export interface IApprovalStatusLabelService {
  /**
   * Get all approval status labels
   */
  findAll(): Promise<ApprovalStatusLabel[]>;

  /**
   * Get approval status label by ID
   */
  findById(id: number): Promise<ApprovalStatusLabel | undefined>;

  /**
   * Get approval status label by status code
   */
  findByStatusCode(statusCode: string): Promise<ApprovalStatusLabel | undefined>;
} 