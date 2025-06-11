import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
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

  @ApiProperty({ description: 'The country type (A, B, or null)', required: false })
  @IsString()
  @IsOptional()
  type?: string | null;

  @ApiProperty({ description: 'The percentage increase for the country', required: false })
  @IsNumber()
  @IsOptional()
  percentIncrease?: number;
}
