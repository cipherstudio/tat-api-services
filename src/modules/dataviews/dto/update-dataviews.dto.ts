import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { CreateDataviewsDto } from './create-dataviews.dto';

/**
 * DTO for updating a dataviews
 * @TypeProperty({
 *   category: 'dto',
 *   description: 'DTO for updating a dataviews',
 *   extends: ['CreateDataviewsDto']
 * })
 */
export class UpdateDataviewsDto extends PartialType(CreateDataviewsDto) {}
