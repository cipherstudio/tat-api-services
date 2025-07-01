import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { CommonQueryDto } from '../../../common/dto/common-query.dtp';

export class QueryOpChildrenTDto extends CommonQueryDto {
  @ApiPropertyOptional({ description: 'PCH_CODE' })
  @IsOptional()
  pchCode?: string;

  @ApiPropertyOptional({ description: 'PCH_NAME' })
  @IsOptional()
  pchName?: string;
}
