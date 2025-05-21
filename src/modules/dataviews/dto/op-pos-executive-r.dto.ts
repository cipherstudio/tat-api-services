import { ApiProperty } from '@nestjs/swagger';

export class OpPosExecutiveRDto {
  @ApiProperty({ required: false })
  ppeCode?: string;

  @ApiProperty({ required: false })
  ppeDescT?: string;

  @ApiProperty({ required: false })
  ppeDescE?: string;

  @ApiProperty({ required: false })
  ppeWeight?: string;

  @ApiProperty({ required: false })
  ppePosLev?: string;
}
