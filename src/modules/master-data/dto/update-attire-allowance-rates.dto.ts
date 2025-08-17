import { PartialType } from '@nestjs/swagger';
import { CreateAttireAllowanceRatesDto } from './create-attire-allowance-rates.dto';

export class UpdateAttireAllowanceRatesDto extends PartialType(CreateAttireAllowanceRatesDto) {} 