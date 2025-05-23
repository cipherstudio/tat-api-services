import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsDate, Min, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class PlacesQueryDto {
  @ApiProperty({ description: 'Page number', required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiProperty({ description: 'Items per page', required: false, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;

  @ApiProperty({ description: 'Order by field', required: false, default: 'id' })
  @IsOptional()
  @IsString()
  @IsIn(['id', 'name', 'createdAt', 'updatedAt'])
  orderBy?: string;

  @ApiProperty({ description: 'Order direction', required: false, default: 'desc', enum: ['asc', 'desc'] })
  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  orderDir?: 'asc' | 'desc';

  @ApiProperty({ description: 'Search term for name', required: false })
  @IsOptional()
  @IsString()
  searchTerm?: string;

  @ApiProperty({ description: 'Filter by creation date after', required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  createdAfter?: Date;

  @ApiProperty({ description: 'Filter by creation date before', required: false })
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