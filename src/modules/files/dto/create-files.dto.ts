import { IsString, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for creating a new files
 * @TypeProperty({
 *   category: 'dto',
 *   description: 'DTO for creating a new files'
 * })
 */
export class CreateFilesDto {
  /**
   * The original name of the file
   * @TypeProperty({
   *   type: 'string',
   *   isOptional: false,
   *   description: 'The original name of the file',
   *   validations: {
   *     isString: true,
   *     minLength: 1
   *   }
   * })
   */
  @ApiProperty({ description: 'The original name of the file' })
  @IsString()
  originalName: string;

  /**
   * The file name stored in the system
   * @TypeProperty({
   *   type: 'string',
   *   isOptional: false,
   *   description: 'The file name stored in the system',
   *   validations: {
   *     isString: true,
   *     minLength: 1
   *   }
   * })
   */
  @ApiProperty({ description: 'The file name stored in the system' })
  @IsString()
  fileName: string;

  /**
   * The MIME type of the file
   * @TypeProperty({
   *   type: 'string',
   *   isOptional: false,
   *   description: 'The MIME type of the file',
   *   validations: {
   *     isString: true,
   *     minLength: 1
   *   }
   * })
   */
  @ApiProperty({ description: 'The MIME type of the file' })
  @IsString()
  mimeType: string;

  /**
   * The file size in bytes
   * @TypeProperty({
   *   type: 'int',
   *   isOptional: false,
   *   description: 'The file size in bytes',
   *   validations: {
   *     isInt: true
   *   }
   * })
   */
  @ApiProperty({ description: 'The file size in bytes' })
  @IsInt()
  size: number;

  /**
   * The path where the file is stored
   * @TypeProperty({
   *   type: 'string',
   *   isOptional: false,
   *   description: 'The path where the file is stored',
   *   validations: {
   *     isString: true,
   *     minLength: 1
   *   }
   * })
   */
  @ApiProperty({ description: 'The path where the file is stored' })
  @IsString()
  path: string;
}
