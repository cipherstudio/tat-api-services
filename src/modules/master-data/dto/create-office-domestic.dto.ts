import { IsString, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for creating a new office domestic
 * @TypeProperty({
 *   category: 'dto',
 *   description: 'DTO for creating a new office domestic'
 * })
 */
export class CreateOfficeDomesticDto {
  /**
   * The name of the office domestic
   * @TypeProperty({
   *   type: 'string',
   *   isOptional: false,
   *   description: 'The name of the office domestic',
   *   validations: {
   *     isString: true,
   *     minLength: 1
   *   }
   * })
   */
  @ApiProperty({ description: 'The name of the office domestic' })
  @IsString()
  name: string;

  /**
   * The region of the office domestic
   * @TypeProperty({
   *   type: 'string',
   *   isOptional: false,
   *   description: 'The region of the office domestic',
   *   validations: {
   *     isString: true,
   *     minLength: 1
   *   }
   * })
   */
  @ApiProperty({ description: 'The region of the office domestic' })
  @IsString()
  region: string;

  /**
   * Whether this is a head office
   * @TypeProperty({
   *   type: 'boolean',
   *   isOptional: true,
   *   description: 'Whether this is a head office',
   *   validations: {
   *     isBoolean: true
   *   }
   * })
   */
  @ApiProperty({ description: 'Whether this is a head office', required: false })
  @IsBoolean()
  @IsOptional()
  isHeadOffice?: boolean;
} 