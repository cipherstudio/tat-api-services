import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateProvincesDto {
  @ApiProperty({ description: 'The province name in Thai', required: false })
  @IsString()
  @IsOptional()
  nameTh?: string;

  @ApiProperty({ description: 'The province name in English', required: false })
  @IsString()
  @IsOptional()
  nameEn?: string;
} 