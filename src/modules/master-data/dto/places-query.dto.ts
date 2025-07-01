import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, IsDate } from 'class-validator';
import { CommonQueryDto } from '../../../common/dto/common-query.dtp';

export class PlacesQueryDto extends CommonQueryDto {
  @ApiProperty({ description: 'Search term for name', required: false })
  @IsOptional()
  @IsString()
  searchTerm?: string;

  @ApiProperty({
    description: 'Filter by creation date after',
    required: false,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  createdAfter?: Date;

  @ApiProperty({
    description: 'Filter by creation date before',
    required: false,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  createdBefore?: Date;

  @ApiProperty({ description: 'Filter by update date after', required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  updatedAfter?: Date;

  @ApiProperty({ description: 'Filter by update date before', required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  updatedBefore?: Date;
}
