import { ApiProperty } from '@nestjs/swagger';

export interface CommitteePosition {
  /**
   * The unique identifier for the committee position
   */
  id: number;

  /**
   * The name of the committee position
   */
  name: string;

  /**
   * When the committee position was created
   */
  createdAt: Date;

  /**
   * When the committee position was last updated
   */
  updatedAt: Date;
}

// Snake case to camel case mapping for database results
export const committeePositionColumnMap = {
  id: 'id',
  name: 'name',
  created_at: 'createdAt',
  updated_at: 'updatedAt',
};

// Camel case to snake case mapping for database inserts
export const committeePositionReverseColumnMap = {
  id: 'id',
  name: 'name',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
}; 