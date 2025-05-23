import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { CreateCountriesDto } from './create-countries.dto';

/**
 * DTO for updating a countries
 * @TypeProperty({
 *   category: 'dto',
 *   description: 'DTO for updating a countries',
 *   extends: ['CreateCountriesDto']
 * })
 */
export class UpdateCountriesDto extends PartialType(CreateCountriesDto) {}
