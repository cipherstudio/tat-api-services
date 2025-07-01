import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { CommonQueryDto } from '../../../common/dto/common-query.dtp';

export class QueryOpPosWorkRDto extends CommonQueryDto {
  @ApiPropertyOptional({ description: 'PSP_CODE' })
  @IsOptional()
  pspCode?: string;

  @ApiPropertyOptional({ description: 'PSP_DESC_T' })
  @IsOptional()
  pspDescT?: string;
}
