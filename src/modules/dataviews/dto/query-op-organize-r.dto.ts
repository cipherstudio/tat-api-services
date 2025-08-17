import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { CommonQueryDto } from '../../../common/dto/common-query.dtp';

export class QueryOpOrganizeRDto extends CommonQueryDto {
  @ApiPropertyOptional({ description: 'POG_CODE' })
  @IsOptional()
  pogCode?: string;

  @ApiPropertyOptional({ description: 'POG_DESC' })
  @IsOptional()
  pogDesc?: string;
}
