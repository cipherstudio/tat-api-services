import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePlacesDto {
  @ApiProperty({ description: 'The name of the place' })
  @IsNotEmpty()
  @IsString()
  name: string;
} 