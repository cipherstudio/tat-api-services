import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for creating a new country
 * @TypeProperty({
 *   category: 'dto',
 *   description: 'DTO for creating a new country'
 * })
 */
export class CreateCountriesDto {
  /**
   * The country code
   * @TypeProperty({
   *   type: 'string',
   *   isOptional: false,
   *   description: 'The country code',
   *   validations: {
   *     isString: true,
   *     isNotEmpty: true
   *   }
   * })
   */
  @ApiProperty({ description: 'The country code' })
  @IsString()
  @IsNotEmpty()
  code: string;

  /**
   * The country name in English
   * @TypeProperty({
   *   type: 'string',
   *   isOptional: false,
   *   description: 'The country name in English',
   *   validations: {
   *     isString: true,
   *     isNotEmpty: true
   *   }
   * })
   */
  @ApiProperty({ description: 'The country name in English' })
  @IsString()
  @IsNotEmpty()
  name_en: string;

  /**
   * The country name in Thai
   * @TypeProperty({
   *   type: 'string',
   *   isOptional: false,
   *   description: 'The country name in Thai',
   *   validations: {
   *     isString: true,
   *     isNotEmpty: true
   *   }
   * })
   */
  @ApiProperty({ description: 'The country name in Thai' })
  @IsString()
  @IsNotEmpty()
  name_th: string;
}
