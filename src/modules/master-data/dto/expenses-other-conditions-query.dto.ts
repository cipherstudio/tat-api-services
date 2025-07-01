import { IsOptional, IsString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CommonQueryDto } from '../../../common/dto/common-query.dtp';

export class ExpensesOtherConditionsQueryDto extends CommonQueryDto {
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
    required: false,
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
