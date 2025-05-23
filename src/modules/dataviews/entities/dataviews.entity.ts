import { ApiProperty } from '@nestjs/swagger';

export interface Dataviews {
  /**
   * The unique identifier for the dataviews
   */
  id: number;

  /**
   * The name of the dataviews
   */
  name: string;

  /**
   * Whether the dataviews is active
   */
  isActive: boolean;

  /**
   * When the dataviews was created
   */
  createdAt: Date;

  /**
   * When the dataviews was last updated
   */
  updatedAt: Date;
}

// Snake case to camel case mapping for database results
export const dataviewsColumnMap = {
  id: 'id',
  name: 'name',
  is_active: 'isActive',
  created_at: 'createdAt',
  updated_at: 'updatedAt',
};

// Camel case to snake case mapping for database inserts
export const dataviewsReverseColumnMap = {
  id: 'id',
  name: 'name',
  isActive: 'is_active',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
};
