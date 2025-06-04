import { PartialType } from '@nestjs/mapped-types';
import { CreateDisbursementSupportingFormDto } from './create-disbursement-supporting-form.dto';

export class UpdateDisbursementSupportingFormDto extends PartialType(
  CreateDisbursementSupportingFormDto,
) {}
