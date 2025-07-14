import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CommonQueryDto } from '../../../common/dto/common-query.dtp';

export class MealAllowanceLevelQueryDto {
  @ApiProperty({ description: 'meal_allowance_id' })
  @IsNumber()
  meal_allowance_id: number;

  @ApiProperty({ description: 'ระดับ/level เช่น 03, กรรมการ' })
  @IsString()
  level: string;
}

export class MealAllowanceQueryDto extends CommonQueryDto {
  @ApiProperty({
    description: 'ประเภท เช่น meeting, training',
    required: false,
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({ description: 'อัตราต่อวัน', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  rate_per_day?: number;

  @ApiProperty({
    description: 'สถานที่',
    enum: ['in', 'out', 'abroad'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['in', 'out', 'abroad'])
  location?: 'in' | 'out' | 'abroad';

  @ApiProperty({
    description: 'รายการระดับ/level',
    type: [MealAllowanceLevelQueryDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @Type(() => MealAllowanceLevelQueryDto)
  levels?: MealAllowanceLevelQueryDto[];
}
