import { ApiProperty } from '@nestjs/swagger';

export class Countries {
  @ApiProperty({ description: 'The unique identifier of the country' })
  id: number;

  @ApiProperty({ description: 'The country code (e.g., TH, US)' })
  code: string;

  @ApiProperty({ description: 'The country name in English' })
  nameEn: string;

  @ApiProperty({ description: 'The country name in Thai' })
  nameTh: string;

  @ApiProperty({ description: 'The country type (A, B, or null)' })
  type: string | null;

  @ApiProperty({ description: 'The percentage increase for the country' })
  percentIncrease: number;

  @ApiProperty({ description: 'The creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'The last update timestamp' })
  updatedAt: Date;
}

// Snake case to camel case mapping for database results
export const countriesColumnMap = {
  id: 'id',
  code: 'code',
  name_en: 'nameEn',
  name_th: 'nameTh',
  type: 'type',
  percent_increase: 'percentIncrease',
  created_at: 'createdAt',
  updated_at: 'updatedAt',
};

// Camel case to snake case mapping for database inserts
export const countriesReverseColumnMap = {
  id: 'id',
  code: 'code',
  nameEn: 'name_en',
  nameTh: 'name_th',
  type: 'type',
  percentIncrease: 'percent_increase',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
};
