import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { CommonQueryDto } from '../../../common/dto/common-query.dtp';

export class QueryPsPwJobDto extends CommonQueryDto {
  @ApiPropertyOptional({ description: 'รหัสพนักงาน' })
  @IsOptional()
  emplid?: string;

  @ApiPropertyOptional({ description: 'รหัสแผนก' })
  @IsOptional()
  deptid?: string;

  @ApiPropertyOptional({ description: 'รหัสตำแหน่ง' })
  @IsOptional()
  positionNbr?: string;
}
