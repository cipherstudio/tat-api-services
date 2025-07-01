import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';
import { CommonQueryDto } from '../../../common/dto/common-query.dtp';

export class QueryAbDeputyDto extends CommonQueryDto {
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
}
