import { PartialType } from '@nestjs/swagger';
import { CreateOfficeDomesticDto } from './create-office-domestic.dto.js';

export class UpdateOfficeDomesticDto extends PartialType(CreateOfficeDomesticDto) {} 