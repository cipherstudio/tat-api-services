import { ApiProperty } from '@nestjs/swagger';

export interface ApprovalStatusLabel {
  /**
   * The unique identifier for the approval status label
   */
  id: number;

  /**
   * The status code (e.g., 'PENDING', 'APPROVED', 'REJECTED')
   */
  statusCode: string;

  /**
   * The display label for the status
   */
  label: string;

  /**
   * When the status label was created
   */
  createdAt: Date;

  /**
   * When the status label was last updated
   */
  updatedAt: Date;
}

export class ApprovalStatusLabelResponseDto {
  @ApiProperty({
    description: 'The unique identifier for the approval status label',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'The status code (e.g., PENDING, APPROVED, REJECTED)',
    example: 'PENDING',
  })
  statusCode: string;

  @ApiProperty({
    description: 'The display label for the status',
    example: 'รอการอนุมัติ',
  })
  label: string;

  @ApiProperty({
    description: 'When the status label was created',
    example: '2025-06-25T12:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'When the status label was last updated',
    example: '2025-06-25T12:00:00.000Z',
  })
  updatedAt: Date;
} 