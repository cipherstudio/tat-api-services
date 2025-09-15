import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsString, IsEnum, IsArray, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class ClothingExpenseCancellationRequestQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  order_by?: string;

  @ApiProperty({ required: false, enum: ['asc', 'desc'] })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  direction?: 'asc' | 'desc';

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  approval_id?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  attachment_id?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  creator_code?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  creator_name?: string;

  @ApiProperty({ required: false, enum: ['pending', 'approved', 'rejected'] })
  @IsOptional()
  @IsEnum(['pending', 'approved', 'rejected'])
  status?: 'pending' | 'approved' | 'rejected';

  @ApiProperty({ required: false, type: [Number] })
  @IsOptional()
  @IsArray()
  @Type(() => Number)
  selected_staff_ids?: number[];

  @ApiProperty({ required: false, description: 'Filter records related to current employee' })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isRelateToMe?: boolean;
}
