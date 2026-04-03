import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { CommonQueryDto } from '../../../common/dto/common-query.dtp';

export class QueryViewDependentBenefDto extends CommonQueryDto {
  @ApiPropertyOptional({
    description: 'รหัสพนักงาน (DEP_EMPLOYEECODE)',
  })
  @IsOptional()
  @IsString()
  depEmployeeCode?: string;

  @ApiPropertyOptional({
    description: 'ความสัมพันธ์ (DEP_RELATION)',
  })
  @IsOptional()
  @IsString()
  depRelation?: string;

  @ApiPropertyOptional({
    description: 'เลขบัตรประชาชน/Passport (DEP_NATIONCARDID)',
  })
  @IsOptional()
  @IsString()
  depNationCardId?: string;
}
