import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateProvincesDto {
  @ApiProperty({ description: 'The province name in Thai' })
  @IsString()
  @IsNotEmpty()
  nameTh: string;

  @ApiProperty({ description: 'The province name in English' })
  @IsString()
  @IsNotEmpty()
  nameEn: string;
} 