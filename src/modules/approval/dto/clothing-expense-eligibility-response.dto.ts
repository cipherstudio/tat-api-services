import { ApiProperty } from '@nestjs/swagger';

export class ClothingExpenseEligibilityResponseDto {
  @ApiProperty({
    description: 'Employee code',
    example: 'EMP001',
  })
  employeeCode: string;

  @ApiProperty({
    description: 'Whether the employee is eligible for clothing expense claim',
    example: true,
  })
  isEligible: boolean;
} 