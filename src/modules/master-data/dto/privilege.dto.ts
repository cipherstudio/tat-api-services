import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';
import { ConfidentialLevel } from '../entities/privilege.entity';

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

  @ApiProperty({
    description: 'The confidential level access for this privilege',
    enum: ConfidentialLevel,
    enumName: 'ConfidentialLevel',
    example: ConfidentialLevel.NORMAL,
    required: false,
  })
  @IsOptional()
  @IsEnum(ConfidentialLevel)
  confidentialLevel?: ConfidentialLevel;
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

  @ApiProperty({
    description: 'The confidential level access for this privilege',
    enum: ConfidentialLevel,
    enumName: 'ConfidentialLevel',
    example: ConfidentialLevel.NORMAL,
    required: false,
  })
  @IsOptional()
  @IsEnum(ConfidentialLevel)
  confidentialLevel?: ConfidentialLevel;
} 