import { Transform, Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsBoolean,
  IsDate,
  IsArray,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CommonQueryDto } from '../../../common/dto/common-query.dtp';

export class QueryDisbursementsupportingDto extends CommonQueryDto {
  @ApiPropertyOptional({
    description: 'Include inactive disbursementsupportings',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  includeInactive?: boolean;

  @ApiPropertyOptional({ description: 'Filter by name (partial match)' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Filter by active status' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  isActive?: boolean;

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

  @ApiPropertyOptional({ description: 'Relations to include', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',') : value,
  )
  includes?: string[];
}
