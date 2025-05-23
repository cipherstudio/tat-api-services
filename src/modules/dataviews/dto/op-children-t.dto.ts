import { ApiProperty } from '@nestjs/swagger';

export class OpChildrenTDto {
  @ApiProperty({ required: false })
  pchCode?: string;

  @ApiProperty({ required: false })
  pchSeqNo?: number;

  @ApiProperty({ required: false })
  pchName?: string;

  @ApiProperty({ required: false })
  pchBirthDate?: string;

  @ApiProperty({ required: false })
  pchSex?: string;

  @ApiProperty({ required: false })
  pchPetition?: string;

  @ApiProperty({ required: false })
  pchTransDate?: string;

  @ApiProperty({ required: false })
  pchOperCode?: string;

  @ApiProperty({ required: false })
  pchPetDate?: string;

  @ApiProperty({ required: false })
  pchPay?: number;

  @ApiProperty({ required: false })
  pchIdcard?: string;
}
