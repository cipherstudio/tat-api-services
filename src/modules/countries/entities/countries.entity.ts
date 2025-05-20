import { ApiProperty } from '@nestjs/swagger';

export class Countries {
  @ApiProperty({ description: 'The unique identifier of the country' })
  id: number;

  @ApiProperty({ description: 'The country code' })
  code: string;

  @ApiProperty({ description: 'The country name in English' })
  name_en: string;

  @ApiProperty({ description: 'The country name in Thai' })
  name_th: string;
}

// Snake case to camel case mapping for database results
export const countriesColumnMap = {
  id: 'id',
  code: 'code',
  name_en: 'name_en',
  name_th: 'name_th',
};

// Camel case to snake case mapping for database inserts
export const countriesReverseColumnMap = {
  id: 'id',
  code: 'code',
  name_en: 'name_en',
  name_th: 'name_th',
};
