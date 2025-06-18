import { ApiProperty } from '@nestjs/swagger';
import { Countries } from './countries.entity.js';
import { Currency } from './currency.entity.js';

export class OfficeInternational {
  @ApiProperty({ description: 'The unique identifier for the office international' })
  id: number;

  @ApiProperty({ description: 'The name of the office international' })
  name: string;

  @ApiProperty({ description: 'The region of the office international' })
  region: string;

  @ApiProperty({ description: 'The POG code of the office international' })
  pogCode: string;

  @ApiProperty({ description: 'The country ID of the office international' })
  countryId: number;

  @ApiProperty({ description: 'The currency ID of the office international' })
  currencyId: number;

  @ApiProperty({ description: 'The country information', type: () => Countries })
  country?: Countries;

  @ApiProperty({ description: 'The currency information', type: () => Currency })
  currency?: Currency;

  @ApiProperty({ description: 'When the office international was created' })
  createdAt: Date;

  @ApiProperty({ description: 'When the office international was last updated' })
  updatedAt: Date;
}

// Snake case to camel case mapping for database results
export const officeInternationalColumnMap = {
  id: 'id',
  name: 'name',
  region: 'region',
  pog_code: 'pogCode',
  country_id: 'countryId',
  currency_id: 'currencyId',
  created_at: 'createdAt',
  updated_at: 'updatedAt',
};

// Camel case to snake case mapping for database inserts
export const officeInternationalReverseColumnMap = {
  id: 'id',
  name: 'name',
  region: 'region',
  pogCode: 'pog_code',
  countryId: 'country_id',
  currencyId: 'currency_id',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
};
