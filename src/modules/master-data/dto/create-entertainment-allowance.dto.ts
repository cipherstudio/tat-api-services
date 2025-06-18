import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEntertainmentAllowanceLevelDto {
  @ApiProperty({ description: 'รหัสสิทธิ์' })
  @IsNumber()
  privilegeId: number;
}

export class CreateEntertainmentAllowanceDto {
  @ApiProperty({ description: 'ชื่อกลุ่ม/ตำแหน่ง' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'จำนวนวันขั้นต่ำ' })
  @IsNumber()
  @Min(0)
  minDays: number;

  @ApiProperty({ description: 'จำนวนวันสูงสุด' })
  @IsNumber()
  @Min(0)
  maxDays: number;

  @ApiProperty({ description: 'จำนวนเงิน' })
  @IsNumber()
  amount: number;

  @ApiProperty({
    description: 'สิทธิ์ที่ได้รับ',
    type: [CreateEntertainmentAllowanceLevelDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateEntertainmentAllowanceLevelDto)
  levels: CreateEntertainmentAllowanceLevelDto[];
}
