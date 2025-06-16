import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class CreateDomesticMovingAllowancesDto {
  @ApiProperty({ description: 'Distance start in kilometers' })
  @IsNumber()
  @Min(0)
  distanceStartKm: number;

  @ApiProperty({ description: 'Distance end in kilometers' })
  @IsNumber()
  @Min(0)
  distanceEndKm: number;

  @ApiProperty({ description: 'Rate in Thai Baht' })
  @IsNumber()
  @Min(0)
  rateBaht: number;
} 