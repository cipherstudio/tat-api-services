import { ApiProperty } from '@nestjs/swagger';

export interface OutsiderEquivalent {
  /**
   * The unique identifier for the outsider equivalent
   */
  id: number;

  /**
   * The name of the outsider equivalent
   */
  name: string;

  /**
   * When the outsider equivalent was created
   */
  createdAt: Date;

  /**
   * When the outsider equivalent was last updated
   */
  updatedAt: Date;
}

// Snake case to camel case mapping for database results
export const outsiderEquivalentColumnMap = {
  id: 'id',
  name: 'name',
  created_at: 'createdAt',
  updated_at: 'updatedAt',
};

// Camel case to snake case mapping for database inserts
export const outsiderEquivalentReverseColumnMap = {
  id: 'id',
  name: 'name',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
}; 