import { ApiProperty } from '@nestjs/swagger';

export class OpHeadTDto {
  @ApiProperty({ required: false })
  phtCode?: string;

  @ApiProperty({ required: false })
  phtNameT?: string;

  @ApiProperty({ required: false })
  phtNameE?: string;

  @ApiProperty({ required: false })
  phtEmpDate?: string;

  @ApiProperty({ required: false })
  phtPosWk?: string;

  @ApiProperty({ required: false })
  phtPosEx?: string;

  @ApiProperty({ required: false })
  phtPosNo?: string;

  @ApiProperty({ required: false })
  phtLevelCode?: string;
}
