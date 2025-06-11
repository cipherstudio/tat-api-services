import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, IsNumber } from 'class-validator';

export class ApprovalAccommodationExpenseDto {
  @ApiProperty({
    description: 'Total amount of accommodation expenses',
    example: 5000,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  totalAmount?: number;

  // ค่าเบี้ยเลี้ยง
  @ApiProperty({
    description: 'Whether has meal outside',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  hasMealOut?: boolean;

  @ApiProperty({
    description: 'Whether has meal inside',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  hasMealIn?: boolean;

  @ApiProperty({
    description: 'Amount for meal outside',
    example: 1000,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  mealOutAmount?: number;

  @ApiProperty({
    description: 'Amount for meal inside',
    example: 800,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  mealInAmount?: number;

  @ApiProperty({
    description: 'Count of meals outside',
    example: 5,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  mealOutCount?: number;

  @ApiProperty({
    description: 'Count of meals inside',
    example: 3,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  mealInCount?: number;

  @ApiProperty({
    description: 'Whether allowance outside is checked',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  allowanceOutChecked?: boolean;

  @ApiProperty({
    description: 'Rate for allowance outside',
    example: 500,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  allowanceOutRate?: number;

  @ApiProperty({
    description: 'Days for allowance outside',
    example: 3,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  allowanceOutDays?: number;

  @ApiProperty({
    description: 'Total for allowance outside',
    example: 1500,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  allowanceOutTotal?: number;

  @ApiProperty({
    description: 'Whether allowance inside is checked',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  allowanceInChecked?: boolean;

  @ApiProperty({
    description: 'Rate for allowance inside',
    example: 400,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  allowanceInRate?: number;

  @ApiProperty({
    description: 'Days for allowance inside',
    example: 2,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  allowanceInDays?: number;

  @ApiProperty({
    description: 'Total for allowance inside',
    example: 800,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  allowanceInTotal?: number;

  // ค่าที่พัก
  @ApiProperty({
    description: 'Whether lodging fixed is checked',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  lodgingFixedChecked?: boolean;

  @ApiProperty({
    description: 'Whether lodging double is checked',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  lodgingDoubleChecked?: boolean;

  @ApiProperty({
    description: 'Whether lodging single is checked',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  lodgingSingleChecked?: boolean;

  @ApiProperty({
    description: 'Number of nights for lodging',
    example: 3,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  lodgingNights?: number;

  @ApiProperty({
    description: 'Rate for lodging',
    example: 1000,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  lodgingRate?: number;

  @ApiProperty({
    description: 'Number of nights for double lodging',
    example: 2,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  lodgingDoubleNights?: number;

  @ApiProperty({
    description: 'Rate for double lodging',
    example: 1500,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  lodgingDoubleRate?: number;

  @ApiProperty({
    description: 'Number of nights for single lodging',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  lodgingSingleNights?: number;

  @ApiProperty({
    description: 'Rate for single lodging',
    example: 2000,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  lodgingSingleRate?: number;

  @ApiProperty({
    description: 'Person for double lodging',
    example: 'John Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  lodgingDoublePerson?: string;

  @ApiProperty({
    description: 'External person for double lodging',
    example: 'Jane Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  lodgingDoublePersonExternal?: string;

  @ApiProperty({
    description: 'Total for lodging',
    example: 3000,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  lodgingTotal?: number;

  // ค่าขนย้ายสิ่งของ
  @ApiProperty({
    description: 'Whether moving cost is checked',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  movingCostChecked?: boolean;

  @ApiProperty({
    description: 'Rate for moving cost',
    example: 1000,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  movingCostRate?: number;
} 