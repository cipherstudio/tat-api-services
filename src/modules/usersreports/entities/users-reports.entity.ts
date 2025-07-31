import { ApiProperty } from '@nestjs/swagger';

export interface UsersReports {
  /**
   * The unique identifier for the report
   */
  id: number;

  /**
   * The user ID
   */
  userId: number;

  /**
   * The employee code
   */
  employeeCode?: string;

  /**
   * The employee name
   */
  employeeName?: string;

  /**
   * The report type (commute, work, expenditure, clothing, activity)
   */
  reportType: string;

  /**
   * The report data
   */
  reportData?: any;

  /**
   * The report date
   */
  reportDate?: Date;

  /**
   * The start date for the report period
   */
  startDate?: Date;

  /**
   * The end date for the report period
   */
  endDate?: Date;

  /**
   * When the report was created
   */
  createdAt: Date;

  /**
   * When the report was last updated
   */
  updatedAt: Date;

  /**
   * When the report was deleted
   */
  deletedAt?: Date;

  /**
   * Approval date ranges for commute reports
   */
  approvalDateRanges?: Array<{
    startDate: string;
    endDate: string;
  }>;
} 