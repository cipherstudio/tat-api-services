import { ApiProperty } from '@nestjs/swagger';

export class Amphurs {
  @ApiProperty({ description: 'The unique identifier of the amphur' })
  id: number;

  @ApiProperty({ description: 'The amphur name in Thai' })
  nameTh: string;

  @ApiProperty({ description: 'The amphur name in English' })
  nameEn: string;

  @ApiProperty({ description: 'The province ID this amphur belongs to' })
  provinceId: number;

  @ApiProperty({ description: 'The province name in Thai' })
  provinceNameTh?: string;

  @ApiProperty({ description: 'The province name in English' })
  provinceNameEn?: string;

  @ApiProperty({ description: 'The creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'The last update timestamp' })
  updatedAt: Date;
}

// Snake case to camel case mapping for database results
export const amphursColumnMap = {
  id: 'id',
  name_th: 'nameTh',
  name_en: 'nameEn',
  province_id: 'provinceId',
  province_name_th: 'provinceNameTh',
  province_name_en: 'provinceNameEn',
  created_at: 'createdAt',
  updated_at: 'updatedAt',
};

// Camel case to snake case mapping for database inserts
export const amphursReverseColumnMap = {
  id: 'id',
  nameTh: 'name_th',
  nameEn: 'name_en',
  provinceId: 'province_id',
  provinceNameTh: 'province_name_th',
  provinceNameEn: 'province_name_en',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
}; 