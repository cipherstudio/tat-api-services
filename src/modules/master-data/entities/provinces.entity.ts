import { ApiProperty } from '@nestjs/swagger';

export class Provinces {
  @ApiProperty({ description: 'The unique identifier of the province' })
  id: number;

  @ApiProperty({ description: 'The province name in Thai' })
  nameTh: string;

  @ApiProperty({ description: 'The province name in English' })
  nameEn: string;

  @ApiProperty({ description: 'Whether the province is a perimeter' })
  isPerimeter: boolean;

  @ApiProperty({ description: 'The creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'The last update timestamp' })
  updatedAt: Date;
}

// Snake case to camel case mapping for database results
export const provincesColumnMap = {
  id: 'id',
  name_th: 'nameTh',
  name_en: 'nameEn',
  is_perimeter: 'isPerimeter',
  created_at: 'createdAt',
  updated_at: 'updatedAt',
};

// Camel case to snake case mapping for database inserts
export const provincesReverseColumnMap = {
  id: 'id',
  nameTh: 'name_th',
  nameEn: 'name_en',
  isPerimeter: 'is_perimeter',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
}; 