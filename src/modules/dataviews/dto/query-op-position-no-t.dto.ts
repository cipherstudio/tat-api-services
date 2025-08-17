import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { CommonQueryDto } from '../../../common/dto/common-query.dtp';

export class QueryOpPositionNoTDto extends CommonQueryDto {
  @ApiPropertyOptional({ description: 'PPN_NUMBER' })
  @IsOptional()
  ppnNumber?: string;

  @ApiPropertyOptional({ description: 'PPN_ORGANIZE' })
  @IsOptional()
  ppnOrganize?: string;
}
