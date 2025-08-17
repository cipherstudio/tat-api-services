import { ApiProperty } from '@nestjs/swagger';

export class OpLevelSalRDto {
  @ApiProperty({ required: false })
  plvCode?: number;

  @ApiProperty({ required: false })
  plvSalary?: number;
}
