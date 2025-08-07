import { ApiProperty } from '@nestjs/swagger';

/**
 * Travel type breakdown for statistics
 */
export class TravelTypeBreakdownDto {
  @ApiProperty({ description: 'Temporary domestic count', example: 26 })
  'temporary-domestic': number;

  @ApiProperty({ description: 'Temporary international count', example: 0 })
  'temporary-international': number;

  @ApiProperty({ description: 'Temporary both count', example: 0 })
  'temporary-both': number;

  @ApiProperty({ description: 'Domestic count', example: 1 })
  domestic: number;

  @ApiProperty({ description: 'International count', example: 1 })
  international: number;

  @ApiProperty({ description: 'Training domestic count', example: 0 })
  'training-domestic': number;

  @ApiProperty({ description: 'Training international count', example: 1 })
  'training-international': number;

  @ApiProperty({ description: 'Unknown or null travel type count', example: 1 })
  unknown: number;
}

/**
 * Status breakdown details
 */
export class StatusBreakdownDto {
  @ApiProperty({ description: 'Total count for this status', example: 30 })
  total: number;

  @ApiProperty({ description: 'Breakdown by travel type', type: TravelTypeBreakdownDto })
  byTravelType: TravelTypeBreakdownDto;
}

/**
 * Summary statistics
 */
export class SummaryDto {
  @ApiProperty({ description: 'Total approvals count', example: 30 })
  total: number;

  @ApiProperty({ description: 'Draft approvals count', example: 30 })
  draft: number;

  @ApiProperty({ description: 'Pending approvals count', example: 0 })
  pending: number;

  @ApiProperty({ description: 'Approved approvals count', example: 0 })
  approved: number;

  @ApiProperty({ description: 'Rejected approvals count', example: 0 })
  rejected: number;

  @ApiProperty({ description: 'To approve count', example: 0 })
  toApprove: number;
}

/**
 * Breakdown statistics by status
 */
export class BreakdownDto {
  @ApiProperty({ description: 'Draft statistics', type: StatusBreakdownDto })
  draft: StatusBreakdownDto;

  @ApiProperty({ description: 'Pending statistics', type: StatusBreakdownDto })
  pending: StatusBreakdownDto;

  @ApiProperty({ description: 'Approved statistics', type: StatusBreakdownDto })
  approved: StatusBreakdownDto;

  @ApiProperty({ description: 'Rejected statistics', type: StatusBreakdownDto })
  rejected: StatusBreakdownDto;

  @ApiProperty({ description: 'To approve statistics', type: StatusBreakdownDto })
  toApprove: StatusBreakdownDto;
}

/**
 * Statistics data
 */
export class StatisticsDataDto {
  @ApiProperty({ description: 'Summary statistics', type: SummaryDto })
  summary: SummaryDto;

  @ApiProperty({ description: 'Detailed breakdown', type: BreakdownDto })
  breakdown: BreakdownDto;
}

/**
 * Response DTO for approval statistics
 */
export class ApprovalStatisticsResponseDto {
  @ApiProperty({ description: 'Success status', example: true })
  success: boolean;

  @ApiProperty({ description: 'Statistics data', type: StatisticsDataDto })
  data: StatisticsDataDto;
} 