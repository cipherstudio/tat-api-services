import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber } from 'class-validator';

export class CheckClothingExpenseEligibilityDto {
  @ApiProperty({
    description: 'List of employee codes to check',
    example: [38801, 66019],
    type: [Number],
  })
  @IsArray()
  @IsNumber({}, { each: true })
  employeeCodes: number[];
} 