import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { CreateOfficeInternationalDto } from './create-office-international.dto.js';

/**
 * DTO for updating a office international
 * @TypeProperty({
 *   category: 'dto',
 *   description: 'DTO for updating a office international',
 *   extends: ['CreateOfficeInternationalDto']
 * })
 */
export class UpdateOfficeInternationalDto extends PartialType(CreateOfficeInternationalDto) {}
