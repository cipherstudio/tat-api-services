import { ApiProperty } from '@nestjs/swagger';

export class AbDeputyDto {
  @ApiProperty()
  gdpId: number;

  @ApiProperty()
  pmtCode: number;

  @ApiProperty()
  gpdDeputyPogCode: string;

  @ApiProperty()
  gdpDeputyPositionEx: string;

  @ApiProperty()
  gdpDeputyPriority: number;

  @ApiProperty({ type: String, format: 'date-time', required: false })
  gdpDeputyStartDate: Date;

  @ApiProperty({ type: String, format: 'date-time', required: false })
  gdpDeputyEndDate: Date;

  @ApiProperty()
  gdpDeputyRemark: string;

  @ApiProperty()
  gdpCreatedBy: number;

  @ApiProperty({ type: String, format: 'date-time', required: false })
  gdpCreatedDate: Date;

  @ApiProperty()
  gdpLastUpdateBy: number;

  @ApiProperty({ type: String, format: 'date-time', required: false })
  gdpLastUpdateDate: Date;

  @ApiProperty()
  gdpDeputyStatus: number;

  @ApiProperty()
  pogCode: string;

  @ApiProperty()
  pogDesc: string;
}
