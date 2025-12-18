import { ApiProperty } from '@nestjs/swagger';

export class ClothingExpenseEligibilityResponseDto {
  @ApiProperty({
    description: 'Employee code',
    example: 66019,
  })
  employeeCode: number;

  @ApiProperty({
    description: 'Whether the employee is eligible for clothing expense claim',
    example: true,
  })
  isEligible: boolean;

  @ApiProperty({
    description: 'Reason why not eligible (only sent when isEligible = false)',
    example: 'วันที่ทำการเบิกครั้งล่าสุด 2024-01-15 ครั้งต่อไปที่เบิกได้ 2026-01-16',
    required: false,
  })
  reason?: string;
}
