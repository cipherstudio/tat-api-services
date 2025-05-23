import { ApiProperty } from '@nestjs/swagger';

export class OpOrganizeRDto {
  @ApiProperty({ required: false })
  pogCode?: string;

  @ApiProperty({ required: false })
  pogDesc?: string;

  @ApiProperty({ required: false })
  pogCurrency?: string;

  @ApiProperty({ required: false })
  pogAbbreviation?: string;

  @ApiProperty({ required: false })
  pogDescE?: string;

  @ApiProperty({ required: false })
  pogTitle?: string;

  @ApiProperty({ required: false })
  pogType?: string;

  @ApiProperty({ required: false })
  pogPosname?: string;
}
