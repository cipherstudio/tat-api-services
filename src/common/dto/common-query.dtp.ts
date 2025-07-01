import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CommonQueryDto {
  @ApiPropertyOptional({ description: 'การเรียงลำดับ', default: 'asc' })
  @IsOptional()
  @IsString()
  orderDir?: 'ASC' | 'DESC' = 'ASC';

  @ApiPropertyOptional({ description: 'การเรียงลำดับ' })
  @IsOptional()
  @IsString()
  orderBy?: string;

  @ApiPropertyOptional({
    description: 'จำนวนรายการต่อหน้า (pagination)',
    type: Number,
    default: 10,
  })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  limit: number = 10;

  @ApiPropertyOptional({
    description: 'ข้ามกี่รายการ (pagination offset)',
    type: Number,
    default: 0,
  })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  offset: number = 0;

  @ApiPropertyOptional({ description: 'หน้าที่ต้องการ (page)', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;
}
