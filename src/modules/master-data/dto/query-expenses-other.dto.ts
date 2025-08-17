import { Transform, Type } from 'class-transformer';
import { IsOptional, IsString, IsDate, IsArray } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CommonQueryDto } from '../../../common/dto/common-query.dtp';

export class QueryExpensesOtherDto extends CommonQueryDto {
  @ApiPropertyOptional({ description: 'Filter by name (partial match)' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Search term for name' })
  @IsOptional()
  @IsString()
  searchTerm?: string;

  @ApiPropertyOptional({ description: 'Filter by creation date (after)' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  createdAfter?: Date;

  @ApiPropertyOptional({ description: 'Filter by creation date (before)' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  createdBefore?: Date;

  @ApiPropertyOptional({ description: 'Filter by update date (after)' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  updatedAfter?: Date;

  @ApiPropertyOptional({ description: 'Filter by update date (before)' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  updatedBefore?: Date;

  @ApiPropertyOptional({ description: 'Relations to include', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',') : value,
  )
  includes?: string[];
}
