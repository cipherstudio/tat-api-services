import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { CommonQueryDto } from '../../../common/dto/common-query.dtp';

export class QueryOpMasterTDto extends CommonQueryDto {
  @ApiPropertyOptional({ description: 'PMT_CODE' })
  @IsOptional()
  pmtCode?: string;

  @ApiPropertyOptional({ description: 'PMT_NAME_T' })
  @IsOptional()
  pmtNameT?: string;
}
