import { Transform, Type } from 'class-transformer';
    import { IsOptional, IsEnum, IsString, IsBoolean, IsDate, IsNumber, IsArray } from 'class-validator';
    import { ApiPropertyOptional } from '@nestjs/swagger';

    export class QueryDisbursementsupportingDto {
      @ApiPropertyOptional({ description: 'Page number', default: 1 })
      @IsOptional()
      @IsNumber()
      @Type(() => Number)
      page?: number;

      @ApiPropertyOptional({ description: 'Number of items per page', default: 10 })
      @IsOptional()
      @IsNumber()
      @Type(() => Number)
      limit?: number;

      @ApiPropertyOptional({ description: 'Field to order by', default: 'createdAt' })
      @IsOptional()
      @IsString()
      orderBy?: string;

      @ApiPropertyOptional({ description: 'Order direction', enum: ['ASC', 'DESC'], default: 'DESC' })
      @IsOptional()
      @IsEnum(['ASC', 'DESC'])
      orderDir?: 'ASC' | 'DESC';

      @ApiPropertyOptional({ description: 'Include inactive disbursementsupportings', default: false })
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
      @Transform(({ value }) => (typeof value === 'string' ? value.split(',') : value))
      includes?: string[];
    }