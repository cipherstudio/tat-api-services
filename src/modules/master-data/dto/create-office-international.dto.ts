import { IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for creating a new office international
 * @TypeProperty({
 *   category: 'dto',
 *   description: 'DTO for creating a new office international'
 * })
 */
export class CreateOfficeInternationalDto {
  /**
   * The name of the office international
   * @TypeProperty({
   *   type: 'string',
   *   isOptional: false,
   *   description: 'The name of the office international',
   *   validations: {
   *     isString: true,
   *     minLength: 1
   *   }
   * })
   */
  @ApiProperty({ description: 'The name of the office international' })
  @IsString()
  name: string;

  /**
   * The region of the office international
   * @TypeProperty({
   *   type: 'string',
   *   isOptional: false,
   *   description: 'The region of the office international',
   *   validations: {
   *     isString: true,
   *     minLength: 1
   *   }
   * })
   */
  @ApiProperty({ description: 'The region of the office international' })
  @IsString()
  region: string;

  /**
   * The country ID of the office international
   * @TypeProperty({
   *   type: 'number',
   *   isOptional: false,
   *   description: 'The country ID of the office international'
   * })
   */
  @ApiProperty({ description: 'The country ID of the office international' })
  @IsNumber()
  countryId: number;

  /**
   * The currency ID of the office international
   * @TypeProperty({
   *   type: 'number',
   *   isOptional: false,
   *   description: 'The currency ID of the office international'
   * })
   */
  @ApiProperty({ description: 'The currency ID of the office international' })
  @IsNumber()
  currencyId: number;
}
