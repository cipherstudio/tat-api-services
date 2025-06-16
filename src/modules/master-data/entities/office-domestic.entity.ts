import { ApiProperty } from '@nestjs/swagger';
import { Provinces } from './provinces.entity.js';

export class OfficeDomestic {
  /**
   * The unique identifier for the office domestic
   */
  @ApiProperty({ description: 'The unique identifier for the office domestic' })
  id: number;

  /**
   * The name of the office domestic
   */
  @ApiProperty({ description: 'The name of the office domestic' })
  name: string;

  /**
   * The region of the office domestic
   */
  @ApiProperty({ description: 'The region of the office domestic' })
  region: string;

  /**
   * Whether this is a head office
   */
  @ApiProperty({ description: 'Whether this is a head office' })
  isHeadOffice: boolean;

  /**
   * The province ID of the office domestic
   */
  @ApiProperty({ description: 'The province ID of the office domestic' })
  provinceId: number;

  /**
   * The province information
   */
  @ApiProperty({ description: 'The province information', type: () => Provinces })
  province?: Provinces;

  /**
   * When the office domestic was created
   */
  @ApiProperty({ description: 'When the office domestic was created' })
  createdAt: Date;

  /**
   * When the office domestic was last updated
   */
  @ApiProperty({ description: 'When the office domestic was last updated' })
  updatedAt: Date;
}

// Snake case to camel case mapping for database results
export const officeDomesticColumnMap = {
  id: 'id',
  name: 'name',
  region: 'region',
  is_head_office: 'isHeadOffice',
  province_id: 'provinceId',
  created_at: 'createdAt',
  updated_at: 'updatedAt',
};

// Camel case to snake case mapping for database inserts
export const officeDomesticReverseColumnMap = {
  id: 'id',
  name: 'name',
  region: 'region',
  isHeadOffice: 'is_head_office',
  provinceId: 'province_id',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
}; 