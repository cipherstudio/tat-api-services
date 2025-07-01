import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { CommonQueryDto } from '../../../common/dto/common-query.dtp';

export class QueryOpPositionTDto extends CommonQueryDto {
  @ApiPropertyOptional({ description: 'EMPLID' })
  @IsOptional()
  emplid?: string;

  @ApiPropertyOptional({ description: 'POSITION_NBR' })
  @IsOptional()
  positionNbr?: string;

  @ApiPropertyOptional({ description: 'DEPTID' })
  @IsOptional()
  deptid?: string;
}
