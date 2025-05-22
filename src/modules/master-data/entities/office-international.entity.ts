import { ApiProperty } from '@nestjs/swagger';

export interface OfficeInternational {
  /**
   * The unique identifier for the office international
   */
  id: number;

  /**
   * The name of the office international
   */
  name: string;

  /**
   * The region of the office international
   */
  region: string;

  /**
   * When the office international was created
   */
  createdAt: Date;

  /**
   * When the office international was last updated
   */
  updatedAt: Date;
}

// Snake case to camel case mapping for database results
export const officeInternationalColumnMap = {
  id: 'id',
  name: 'name',
  region: 'region',
  created_at: 'createdAt',
  updated_at: 'updatedAt',
};

// Camel case to snake case mapping for database inserts
export const officeInternationalReverseColumnMap = {
  id: 'id',
  name: 'name',
  region: 'region',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
};
