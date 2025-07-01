import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { CommonQueryDto } from '../../../common/dto/common-query.dtp';

export class QueryOpLevelSalRDto extends CommonQueryDto {
  @ApiPropertyOptional({ description: 'PLV_CODE' })
  @IsOptional()
  plvCode?: number;
}
