import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateProvincesDto {
  @ApiProperty({ description: 'The province name in Thai', required: false })
  @IsString()
  @IsOptional()
  nameTh?: string;

  @ApiProperty({ description: 'The province name in English', required: false })
  @IsString()
  @IsOptional()
  nameEn?: string;

  @ApiProperty({ description: 'Whether the province is a perimeter', required: false })
  @IsBoolean()
  @IsOptional()
  isPerimeter?: boolean;
} 