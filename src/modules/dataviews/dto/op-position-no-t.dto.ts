import { ApiProperty } from '@nestjs/swagger';

export class OpPositionNoTDto {
  @ApiProperty({ required: false })
  ppnNumber?: string;

  @ApiProperty({ required: false })
  ppnOrganize?: string;

  @ApiProperty({ required: false })
  ppnTransDate?: string;

  @ApiProperty({ required: false })
  ppnOperCode?: string;
}
