import { ApiProperty } from '@nestjs/swagger';

export interface OfficeDomestic {
  /**
   * The unique identifier for the office domestic
   */
  id: number;

  /**
   * The name of the office domestic
   */
  name: string;

  /**
   * The region of the office domestic
   */
  region: string;

  /**
   * Whether this is a head office
   */
  isHeadOffice: boolean;

  /**
   * When the office domestic was created
   */
  createdAt: Date;

  /**
   * When the office domestic was last updated
   */
  updatedAt: Date;
}

// Snake case to camel case mapping for database results
export const officeDomesticColumnMap = {
  id: 'id',
  name: 'name',
  region: 'region',
  is_head_office: 'isHeadOffice',
  created_at: 'createdAt',
  updated_at: 'updatedAt',
};

// Camel case to snake case mapping for database inserts
export const officeDomesticReverseColumnMap = {
  id: 'id',
  name: 'name',
  region: 'region',
  isHeadOffice: 'is_head_office',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
}; 