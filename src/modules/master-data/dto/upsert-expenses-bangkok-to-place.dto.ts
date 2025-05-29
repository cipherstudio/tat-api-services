import { IsNotEmpty, IsNumber, ValidateNested, ArrayNotEmpty, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

class RateDto {
  @IsNotEmpty()
  @IsNumber()
  placeId: number;

  @IsNotEmpty()
  @IsNumber()
  rate: number;
}

export class UpsertExpensesBangkokToPlaceDto {
  @IsNotEmpty()
  @IsNumber()
  amphurId: number;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => RateDto)
  rates: RateDto[];
} 