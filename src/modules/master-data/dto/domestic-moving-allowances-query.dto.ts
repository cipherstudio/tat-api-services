import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsDate, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { CommonQueryDto } from '../../../common/dto/common-query.dtp';

export class DomesticMovingAllowancesQueryDto extends CommonQueryDto {
  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  distanceStartKm?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  distanceEndKm?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  rateBaht?: number;

  @ApiProperty({
    required: false,
    description:
      'Search term for distance (will find records where the distance falls within the range)',
  })
  @IsString()
  @IsOptional()
  searchTerm?: string;

  @ApiProperty({ required: false })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  createdAfter?: Date;

  @ApiProperty({ required: false })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  createdBefore?: Date;

  @ApiProperty({ required: false })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  updatedAfter?: Date;

  @ApiProperty({ required: false })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  updatedBefore?: Date;
}
