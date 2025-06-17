import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class CreatePrivilegeDto {
  @ApiProperty({
    description: 'The name of the privilege',
    example: 'Admin',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Whether this privilege is a committee position',
    example: false,
  })
  @IsNotEmpty()
  @IsBoolean()
  isCommitteePosition: boolean;

  @ApiProperty({
    description: 'Whether this privilege is equivalent to an outsider',
    example: false,
  })
  @IsNotEmpty()
  @IsBoolean()
  isOutsiderEquivalent: boolean;
}

export class UpdatePrivilegeDto {
  @ApiProperty({
    description: 'The name of the privilege',
    example: 'Admin',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Whether this privilege is a committee position',
    example: false,
  })
  @IsNotEmpty()
  @IsBoolean()
  isCommitteePosition: boolean;

  @ApiProperty({
    description: 'Whether this privilege is equivalent to an outsider',
    example: false,
  })
  @IsNotEmpty()
  @IsBoolean()
  isOutsiderEquivalent: boolean;
} 