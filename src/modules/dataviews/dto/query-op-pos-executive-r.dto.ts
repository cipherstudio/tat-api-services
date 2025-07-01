import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { CommonQueryDto } from '../../../common/dto/common-query.dtp';

export class QueryOpPosExecutiveRDto extends CommonQueryDto {
  @ApiPropertyOptional({ description: 'PPE_CODE' })
  @IsOptional()
  ppeCode?: string;

  @ApiPropertyOptional({ description: 'PPE_DESC_T' })
  @IsOptional()
  ppeDescT?: string;
}
