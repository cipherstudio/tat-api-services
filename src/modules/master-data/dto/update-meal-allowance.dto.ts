import { PartialType } from '@nestjs/swagger';
import {
  CreateMealAllowanceDto,
  CreateMealAllowanceLevelDto,
} from './create-meal-allowance.dto';

export class UpdateMealAllowanceLevelDto extends PartialType(
  CreateMealAllowanceLevelDto,
) {}

export class UpdateMealAllowanceDto extends PartialType(
  CreateMealAllowanceDto,
) {}
