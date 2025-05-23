import { PartialType } from '@nestjs/mapped-types';
import { CreateExpensesOtherDto } from './create-expenses-other.dto';

export class UpdateExpensesOtherDto extends PartialType(CreateExpensesOtherDto) {} 