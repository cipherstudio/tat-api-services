import { PartialType } from '@nestjs/swagger';
import { CreateDomesticMovingAllowancesDto } from './create-domestic-moving-allowances.dto';

export class UpdateDomesticMovingAllowancesDto extends PartialType(CreateDomesticMovingAllowancesDto) {} 