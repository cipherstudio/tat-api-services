import { ApiProperty } from '@nestjs/swagger';

export class TrainingCountry {
  @ApiProperty() id: number;
  @ApiProperty() code: string;
  @ApiProperty() nameEn: string;
  @ApiProperty() nameTh: string;
  @ApiProperty({ nullable: true }) type: string | null;
  @ApiProperty() percentIncrease: number;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}
