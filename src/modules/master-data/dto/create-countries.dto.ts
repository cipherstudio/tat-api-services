import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for creating a new country
 */
export class CreateCountriesDto {
  @ApiProperty({ description: 'The country code (e.g., TH, US)' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: 'The country name in English' })
  @IsString()
  @IsNotEmpty()
  nameEn: string;

  @ApiProperty({ description: 'The country name in Thai' })
  @IsString()
  @IsNotEmpty()
  nameTh: string;
}
