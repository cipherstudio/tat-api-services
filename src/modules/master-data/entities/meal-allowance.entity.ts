import { ApiProperty } from '@nestjs/swagger';

export class MealAllowance {
  @ApiProperty({ description: 'PK: meal_allowance_id' })
  meal_allowance_id: number;

  @ApiProperty({ description: 'ประเภท เช่น meeting, training' })
  type: string;

  @ApiProperty({ description: 'อัตราต่อวัน' })
  rate_per_day: number;

  @ApiProperty({ description: 'อัตราต่อ 2 วัน' })
  rate_per_2_days: number;

  @ApiProperty({ description: 'สถานที่', enum: ['in', 'out', 'abroad'] })
  location: 'in' | 'out' | 'abroad';

  @ApiProperty({ description: 'วันที่สร้าง' })
  created_at: Date;

  @ApiProperty({ description: 'วันที่แก้ไขล่าสุด' })
  updated_at: Date;

  @ApiProperty({
    description: 'รายการระดับ/level',
    type: () => [MealAllowanceLevel],
    required: false,
  })
  levels?: MealAllowanceLevel[];
}

export class MealAllowanceLevel {
  @ApiProperty({ description: 'meal_allowance_id' })
  meal_allowance_id: number;

  @ApiProperty({ description: 'ระดับ/level เช่น 03, กรรมการ' })
  level: string;
}

export const mealAllowanceColumnMap = {
  meal_allowance_id: 'meal_allowance_id',
  type: 'type',
  rate_per_day: 'rate_per_day',
  rate_per_2_days: 'rate_per_2_days',
  location: 'location',
  created_at: 'created_at',
  updated_at: 'updated_at',
};

export const mealAllowanceReverseColumnMap = {
  meal_allowance_id: 'meal_allowance_id',
  type: 'type',
  rate_per_day: 'rate_per_day',
  rate_per_2_days: 'rate_per_2_days',
  location: 'location',
  created_at: 'created_at',
  updated_at: 'updated_at',
};

export const mealAllowanceLevelColumnMap = {
  meal_allowance_id: 'meal_allowance_id',
  level: 'level',
};

export const mealAllowanceLevelReverseColumnMap = {
  meal_allowance_id: 'meal_allowance_id',
  level: 'level',
};
