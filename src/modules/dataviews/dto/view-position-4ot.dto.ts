import { ApiProperty } from '@nestjs/swagger';

export class ViewPosition4otDto {
  @ApiProperty({ required: false })
  posPositioncode?: string;

  @ApiProperty({ required: false })
  posPositionname?: string;

  @ApiProperty({ required: false })
  posReportsTo?: string;

  @ApiProperty({ required: false })
  posReportsToname?: string;

  @ApiProperty({ required: false })
  posDeptId?: string;

  @ApiProperty({ required: false })
  posJobCode?: string;

  @ApiProperty({ required: false })
  posEffDate?: Date;

  @ApiProperty({ required: false })
  posIsheader?: string;

  @ApiProperty({ required: false })
  posSupvLvlId?: string;

  @ApiProperty({ required: false })
  posLangCd?: string;

  @ApiProperty({ required: false })
  descr?: string;

  @ApiProperty({ required: false })
  descrshot?: string;
}
