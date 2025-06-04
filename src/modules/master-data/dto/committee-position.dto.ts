import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCommitteePositionDto {
  @ApiProperty({
    description: 'The name of the committee position',
    example: 'Chairman',
  })
  @IsNotEmpty()
  @IsString()
  name: string;
}

export class UpdateCommitteePositionDto {
  @ApiProperty({
    description: 'The name of the committee position',
    example: 'Chairman',
  })
  @IsNotEmpty()
  @IsString()
  name: string;
} 