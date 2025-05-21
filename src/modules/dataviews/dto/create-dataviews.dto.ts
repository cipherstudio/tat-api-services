import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for creating a new dataviews
 * @TypeProperty({
 *   category: 'dto',
 *   description: 'DTO for creating a new dataviews'
 * })
 */
export class CreateDataviewsDto {
  /**
   * The name of the dataviews
   * @TypeProperty({
   *   type: 'string',
   *   isOptional: false,
   *   description: 'The name of the dataviews',
   *   validations: {
   *     isString: true,
   *     minLength: 1
   *   }
   * })
   */
  @ApiProperty({ description: 'The name of the dataviews' })
  @IsString()
  name: string;

  /**
   * Whether the dataviews is active
   * @TypeProperty({
   *   type: 'boolean',
   *   isOptional: true,
   *   description: 'Whether the dataviews is active',
   *   defaultValue: true,
   *   validations: {
   *     isBoolean: true
   *   }
   * })
   */
  @ApiProperty({ description: 'Whether the dataviews is active', required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
