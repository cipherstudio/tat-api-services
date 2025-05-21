import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsNumber } from 'class-validator';

export class QueryAbDeputyDto {
  @ApiPropertyOptional({ description: 'GDP_ID' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  gdpId?: number;

  @ApiPropertyOptional({ description: 'PMT_CODE' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  pmtCode?: number;

  @ApiPropertyOptional({ description: 'POG_CODE' })
  @IsOptional()
  pogCode?: string;

  @ApiPropertyOptional({ description: 'GDP_DEPUTY_STATUS' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  gdpDeputyStatus?: number;

  @ApiPropertyOptional({
    description: 'จำนวนรายการต่อหน้า (pagination)',
    type: Number,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit: number = 10;

  @ApiPropertyOptional({
    description: 'ข้ามกี่รายการ (pagination offset)',
    type: Number,
    default: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  offset: number = 0;
}
