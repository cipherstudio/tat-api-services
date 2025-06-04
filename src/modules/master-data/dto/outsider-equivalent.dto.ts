import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateOutsiderEquivalentDto {
  @ApiProperty({
    description: 'The name of the outsider equivalent',
    example: 'Senior Manager',
  })
  @IsNotEmpty()
  @IsString()
  name: string;
}

export class UpdateOutsiderEquivalentDto {
  @ApiProperty({
    description: 'The name of the outsider equivalent',
    example: 'Senior Manager',
  })
  @IsNotEmpty()
  @IsString()
  name: string;
} 