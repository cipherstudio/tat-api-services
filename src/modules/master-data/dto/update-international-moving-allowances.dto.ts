import { PartialType } from '@nestjs/swagger';
import { CreateInternationalMovingAllowancesDto } from './create-international-moving-allowances.dto';

export class UpdateInternationalMovingAllowancesDto extends PartialType(CreateInternationalMovingAllowancesDto) {} 