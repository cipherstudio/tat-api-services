import { PartialType } from '@nestjs/mapped-types';
import { CreateTrainingCountryDto } from './create-training-countries.dto';

export class UpdateTrainingCountryDto extends PartialType(CreateTrainingCountryDto) {}
