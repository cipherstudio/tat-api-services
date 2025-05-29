import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsBoolean } from 'class-validator';

export class CreateProvincesDto {
  @ApiProperty({ description: 'The province name in Thai' })
  @IsString()
  @IsNotEmpty()
  nameTh: string;

  @ApiProperty({ description: 'The province name in English' })
  @IsString()
  @IsNotEmpty()
  nameEn: string;

  @ApiProperty({ description: 'Whether the province is a perimeter' })
  @IsBoolean()
  @IsNotEmpty()
  isPerimeter: boolean;
} 