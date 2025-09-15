import { PartialType } from '@nestjs/swagger';
import { CreateClothingExpenseCancellationRequestDto } from './create-clothing-expense-cancellation-request.dto';

export class UpdateClothingExpenseCancellationRequestDto extends PartialType(CreateClothingExpenseCancellationRequestDto) {}
