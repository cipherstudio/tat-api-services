import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for creating a new disbursementsupporting
 * @TypeProperty({
 *   category: 'dto',
 *   description: 'DTO for creating a new disbursementsupporting'
 * })
 */
export class CreateDisbursementsupportingDto {
  /**
   * The name of the disbursementsupporting
   * @TypeProperty({
   *   type: 'string',
   *   isOptional: false,
   *   description: 'The name of the disbursementsupporting',
   *   validations: {
   *     isString: true,
   *     minLength: 1
   *   }
   * })
   */
  @ApiProperty({ description: 'The name of the disbursementsupporting' })
  @IsString()
  name: string;

  /**
   * Whether the disbursementsupporting is active
   * @TypeProperty({
   *   type: 'boolean',
   *   isOptional: true,
   *   description: 'Whether the disbursementsupporting is active',
   *   defaultValue: true,
   *   validations: {
   *     isBoolean: true
   *   }
   * })
   */
  @ApiProperty({ description: 'Whether the disbursementsupporting is active', required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
