import { PartialType } from '@nestjs/swagger';
import { CreateConfidentialAccessControlDto } from './create-confidential-access-control.dto';

/**
 * DTO for updating confidential access control
 */
export class UpdateConfidentialAccessControlDto extends PartialType(CreateConfidentialAccessControlDto) {} 