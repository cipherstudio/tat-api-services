import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsNumber } from 'class-validator';

export class QueryPsPwJobDto {
  @ApiPropertyOptional({ description: 'รหัสพนักงาน' })
  @IsOptional()
  emplid?: string;

  @ApiPropertyOptional({ description: 'รหัสแผนก' })
  @IsOptional()
  deptid?: string;

  @ApiPropertyOptional({ description: 'รหัสตำแหน่ง' })
  @IsOptional()
  positionNbr?: string;

  @ApiPropertyOptional({
    description: 'จำนวนรายการต่อหน้า',
    example: 10,
    type: Number,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit: number = 10;

  @ApiPropertyOptional({
    description: 'ข้ามกี่รายการ',
    example: 0,
    type: Number,
    default: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  offset: number = 0;
}
