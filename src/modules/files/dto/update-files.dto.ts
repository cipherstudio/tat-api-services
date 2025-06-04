import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { CreateFilesDto } from './create-files.dto';

/**
 * DTO for updating a files
 * @TypeProperty({
 *   category: 'dto',
 *   description: 'DTO for updating a files',
 *   extends: ['CreateFilesDto']
 * })
 */
export class UpdateFilesDto extends PartialType(CreateFilesDto) {}
