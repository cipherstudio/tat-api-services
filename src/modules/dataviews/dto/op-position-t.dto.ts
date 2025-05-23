import { ApiProperty } from '@nestjs/swagger';

export class OpPositionTDto {
  @ApiProperty({ required: false })
  emplid?: string;

  @ApiProperty({ required: false })
  emplRcd?: number;

  @ApiProperty({ required: false })
  effdt?: Date;

  @ApiProperty({ required: false })
  effseq?: number;

  @ApiProperty({ required: false })
  hireDt?: Date;

  @ApiProperty({ required: false })
  positionNbr?: string;

  @ApiProperty({ required: false })
  salAdminPlan?: string;

  @ApiProperty({ required: false })
  grade?: string;

  @ApiProperty({ required: false })
  step?: number;

  @ApiProperty({ required: false })
  deptid?: string;

  @ApiProperty({ required: false })
  officerCd?: string;

  @ApiProperty({ required: false })
  action?: string;

  @ApiProperty({ required: false })
  actionReason?: string;

  @ApiProperty({ required: false })
  xOrderNo?: string;

  @ApiProperty({ required: false })
  xOrderDt?: Date;

  @ApiProperty({ required: false })
  location?: string;

  @ApiProperty({ required: false })
  jobcode?: string;

  @ApiProperty({ required: false })
  setidDept?: string;

  @ApiProperty({ required: false })
  supvLvlId?: string;

  @ApiProperty({ required: false })
  hrStatus?: string;

  @ApiProperty({ required: false })
  lastupdDttm?: Date;
}
