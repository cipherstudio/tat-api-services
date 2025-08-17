import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsNumber, IsDate, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class AttireDestinationGroupsQueryDto {
  @ApiProperty({ description: 'Page number', required: false, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiProperty({ description: 'Number of items per page', required: false, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;

  @ApiProperty({ 
    description: 'Field to order by', 
    required: false,
    enum: ['id', 'groupCode', 'groupName', 'assignmentType', 'createdAt', 'updatedAt']
  })
  @IsOptional()
  @IsString()
  orderBy?: 'id' | 'groupCode' | 'groupName' | 'assignmentType' | 'createdAt' | 'updatedAt';

  @ApiProperty({ description: 'Order direction', required: false, enum: ['asc', 'desc'] })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  orderDir?: 'asc' | 'desc';

  @ApiProperty({ 
    description: 'Assignment type filter', 
    required: false, 
    enum: ['TEMPORARY', 'PERMANENT'] 
  })
  @IsOptional()
  @IsEnum(['TEMPORARY', 'PERMANENT'])
  assignmentType?: 'TEMPORARY' | 'PERMANENT';

  @ApiProperty({ description: 'Group code filter', required: false })
  @IsOptional()
  @IsString()
  groupCode?: string;

  @ApiProperty({ description: 'Search term for group name or description', required: false })
  @IsOptional()
  @IsString()
  searchTerm?: string;

  @ApiProperty({ description: 'Created after this date', required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  createdAfter?: Date;

  @ApiProperty({ description: 'Created before this date', required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  createdBefore?: Date;

  @ApiProperty({ description: 'Updated after this date', required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  updatedAfter?: Date;

  @ApiProperty({ description: 'Updated before this date', required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  updatedBefore?: Date;
} 