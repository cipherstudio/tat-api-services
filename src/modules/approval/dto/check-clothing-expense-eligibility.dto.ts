import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class CheckClothingExpenseEligibilityDto {
  @ApiProperty({
    description: 'List of employee codes to check',
    example: ['EMP001', 'EMP002'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  employeeCodes: string[];
} 