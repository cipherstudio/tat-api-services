import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ConfidentialLevel } from '../entities/confidential-access-control.entity';

/**
 * DTO for creating a new confidential access control
 */
export class CreateConfidentialAccessControlDto {
  @ApiProperty({ description: 'Position title' })
  @IsString()
  @IsNotEmpty()
  position: string;

  @ApiProperty({ 
    description: 'Confidential level access',
    enum: ConfidentialLevel,
    enumName: 'ConfidentialLevel',
    example: ConfidentialLevel.CONFIDENTIAL
  })
  @IsEnum(ConfidentialLevel)
  @IsNotEmpty()
  confidentialLevel: ConfidentialLevel;
} 