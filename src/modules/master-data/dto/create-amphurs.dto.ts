import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateAmphursDto {
  @ApiProperty({ description: 'The amphur name in Thai' })
  @IsString()
  @IsNotEmpty()
  nameTh: string;

  @ApiProperty({ description: 'The amphur name in English' })
  @IsString()
  @IsNotEmpty()
  nameEn: string;

  @ApiProperty({ description: 'The province ID this amphur belongs to' })
  @IsNumber()
  @IsNotEmpty()
  provinceId: number;
} 