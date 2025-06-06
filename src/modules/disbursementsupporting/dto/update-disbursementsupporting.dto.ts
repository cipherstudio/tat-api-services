import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { CreateDisbursementsupportingDto } from './create-disbursementsupporting.dto';

/**
 * DTO for updating a disbursementsupporting
 * @TypeProperty({
 *   category: 'dto',
 *   description: 'DTO for updating a disbursementsupporting',
 *   extends: ['CreateDisbursementsupportingDto']
 * })
 */
export class UpdateDisbursementsupportingDto extends PartialType(CreateDisbursementsupportingDto) {}
