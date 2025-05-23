import { ApiProperty } from '@nestjs/swagger';

export class OpMasterTDto {
  @ApiProperty({ required: false })
  pmtCode?: string;

  @ApiProperty({ required: false })
  pmtNameT?: string;

  @ApiProperty({ required: false })
  pmtNameE?: string;

  @ApiProperty({ required: false })
  pmtEmpDate?: string;

  @ApiProperty({ required: false })
  pmtCmdDate?: string;

  @ApiProperty({ required: false })
  pmtStQual?: string;

  @ApiProperty({ required: false })
  pmtStFac?: string;

  @ApiProperty({ required: false })
  pmtPosWk?: string;

  @ApiProperty({ required: false })
  pmtPosEx?: string;

  @ApiProperty({ required: false })
  pmtPosNo?: string;

  @ApiProperty({ required: false })
  pmtLevelCode?: string;

  @ApiProperty({ required: false })
  pmtLevDate?: string;

  @ApiProperty({ required: false })
  pmtCurQual?: string;

  @ApiProperty({ required: false })
  pmtCurFac?: string;

  @ApiProperty({ required: false })
  pmtSalCode?: string;

  @ApiProperty({ required: false })
  pmtStatus?: string;

  @ApiProperty({ required: false })
  pmtPenaltyFlag?: string;

  @ApiProperty({ required: false })
  pmtTransDate?: string;

  @ApiProperty({ required: false })
  pmtOperCode?: string;

  @ApiProperty({ required: false })
  pmtFlagMem?: string;

  @ApiProperty({ required: false })
  pmtGworkCode?: string;

  @ApiProperty({ required: false })
  pmtEmailAddr?: string;
}
