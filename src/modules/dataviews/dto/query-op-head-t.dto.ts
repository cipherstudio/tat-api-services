import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { CommonQueryDto } from '../../../common/dto/common-query.dtp';

export class QueryOpHeadTDto extends CommonQueryDto {
  @ApiPropertyOptional({ description: 'PHT_CODE' })
  @IsOptional()
  phtCode?: string;

  @ApiPropertyOptional({ description: 'PHT_NAME_T' })
  @IsOptional()
  phtNameT?: string;
}
