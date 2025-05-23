import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdatePlacesDto {
  @ApiProperty({ description: 'The name of the place', required: false })
  @IsOptional()
  @IsString()
  name?: string;
} 