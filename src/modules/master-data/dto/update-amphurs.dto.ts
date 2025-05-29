import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';

export class UpdateAmphursDto {
  @ApiProperty({ description: 'The amphur name in Thai', required: false })
  @IsString()
  @IsOptional()
  nameTh?: string;

  @ApiProperty({ description: 'The amphur name in English', required: false })
  @IsString()
  @IsOptional()
  nameEn?: string;

  @ApiProperty({ description: 'The province ID this amphur belongs to', required: false })
  @IsNumber()
  @IsOptional()
  provinceId?: number;
} 