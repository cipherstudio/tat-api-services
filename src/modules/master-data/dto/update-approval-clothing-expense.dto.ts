import { PartialType } from '@nestjs/swagger';
import { CreateApprovalClothingExpenseDto } from './create-approval-clothing-expense.dto';

export class UpdateApprovalClothingExpenseDto extends PartialType(
  CreateApprovalClothingExpenseDto,
) {}
