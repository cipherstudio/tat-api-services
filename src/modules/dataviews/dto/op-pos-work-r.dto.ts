import { ApiProperty } from '@nestjs/swagger';

export class OpPosWorkRDto {
  @ApiProperty({ required: false })
  pspCode?: string;

  @ApiProperty({ required: false })
  pspDescT?: string;

  @ApiProperty({ required: false })
  pspDescE?: string;
}
