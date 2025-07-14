import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMealAllowanceLevelDto {
  @ApiProperty({ description: 'meal_allowance_id' })
  @IsNumber()
  meal_allowance_id: number;

  @ApiProperty({ description: 'ระดับ/level เช่น 03, กรรมการ' })
  @IsString()
  level: string;
}

export class CreateMealAllowanceDto {
  @ApiProperty({
    description: 'ประเภท เช่น meeting, training',
    enum: ['meeting', 'training'],
  })
  @IsString()
  type: string;

  @ApiProperty({ description: 'อัตราต่อวัน' })
  @IsNumber()
  @Min(0)
  rate_per_day: number;

  @ApiProperty({ description: 'อัตราต่อ 2 วัน' })
  @IsNumber()
  @Min(0)
  rate_per_2_days: number;

  @ApiProperty({
    description: 'สถานที่',
    enum: ['in', 'out', 'abroad'],
  })
  @IsEnum(['in', 'out', 'abroad'])
  location: 'in' | 'out' | 'abroad';

  @ApiProperty({
    description: 'รายการระดับ/level',
    type: [CreateMealAllowanceLevelDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMealAllowanceLevelDto)
  levels?: CreateMealAllowanceLevelDto[];
}
