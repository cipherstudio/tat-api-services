import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { CommonQueryDto } from '../../../common/dto/common-query.dtp';

export class QueryViewPosition4otDto extends CommonQueryDto {
  @ApiPropertyOptional({ description: 'POS_POSITIONCODE' })
  @IsOptional()
  posPositioncode?: string;

  @ApiPropertyOptional({ description: 'POS_POSITIONNAME' })
  @IsOptional()
  posPositionname?: string;

  @ApiPropertyOptional({ description: 'POS_DEPT_ID' })
  @IsOptional()
  posDeptId?: string;
}
