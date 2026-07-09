import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsEnum, IsOptional, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class TrainingAccommodationRatesQueryDto {
  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  limit?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  orderBy?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  orderDir?: 'ASC' | 'DESC';

  @ApiProperty({ required: false })
  @IsEnum(['DOMESTIC', 'INTERNATIONAL'])
  @IsOptional()
  travelType?: 'DOMESTIC' | 'INTERNATIONAL';

  @ApiProperty({ required: false })
  @IsEnum(['type-a', 'type-b', 'outsider'])
  @IsOptional()
  trainingType?: 'type-a' | 'type-b' | 'outsider';

  @ApiProperty({ required: false })
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
