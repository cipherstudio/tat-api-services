import { IsOptional, IsString, IsNumber, IsDate, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ExpensesOtherConditionsQueryDto {
  @ApiProperty({ description: 'Page number', required: false })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @ApiProperty({ description: 'Items per page', required: false })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  limit?: number;

  @ApiProperty({ 
    description: 'Field to order by',
    enum: ['id', 'expensesOtherId', 'positionName', 'positionCode', 'levelCode', 'scope', 'maxAmount', 'createdAt', 'updatedAt'],
    required: false 
  })
  @IsEnum(['id', 'expensesOtherId', 'positionName', 'positionCode', 'levelCode', 'scope', 'maxAmount', 'createdAt', 'updatedAt'])
  @IsOptional()
  orderBy?: 'id' | 'expensesOtherId' | 'positionName' | 'positionCode' | 'levelCode' | 'scope' | 'maxAmount' | 'createdAt' | 'updatedAt';

  @ApiProperty({ 
    description: 'Order direction',
    enum: ['ASC', 'DESC'],
    required: false 
  })
  @IsEnum(['ASC', 'DESC'])
  @IsOptional()
  orderDir?: 'ASC' | 'DESC';

  @ApiProperty({ description: 'ชื่อตำแหน่ง', required: false })
  @IsString()
  @IsOptional()
  positionName?: string;

  @ApiProperty({ description: 'รหัสตำแหน่ง', required: false })
  @IsString()
  @IsOptional()
  positionCode?: string;

  @ApiProperty({ description: 'รหัสระดับ', required: false })
  @IsString()
  @IsOptional()
  levelCode?: string;

  @ApiProperty({ 
    description: 'ขอบเขต',
    enum: ['domestic', 'international'],
    required: false 
  })
  @IsEnum(['domestic', 'international'])
  @IsOptional()
  scope?: 'domestic' | 'international';

  @ApiProperty({ description: 'Search term', required: false })
  @IsString()
  @IsOptional()
  searchTerm?: string;

  @ApiProperty({ description: 'Created after date', required: false })
  @IsOptional()
  @Type(() => Date)
  createdAfter?: Date;

  @ApiProperty({ description: 'Created before date', required: false })
  @IsOptional()
  @Type(() => Date)
  createdBefore?: Date;

  @ApiProperty({ description: 'Updated after date', required: false })
  @IsOptional()
  @Type(() => Date)
  updatedAfter?: Date;

  @ApiProperty({ description: 'Updated before date', required: false })
  @IsOptional()
  @Type(() => Date)
  updatedBefore?: Date;
} 