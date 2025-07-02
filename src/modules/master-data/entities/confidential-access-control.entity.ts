import { ApiProperty } from '@nestjs/swagger';

export enum ConfidentialLevel {
  NORMAL = 'NORMAL',
  CONFIDENTIAL = 'CONFIDENTIAL',
  SECRET = 'SECRET',
  TOP_SECRET = 'TOP_SECRET',
}

export class ConfidentialAccessControl {
  @ApiProperty({ description: 'The unique identifier' })
  id: number;

  @ApiProperty({ description: 'Position title' })
  position: string;

  @ApiProperty({ 
    description: 'Confidential level access',
    enum: ConfidentialLevel,
    enumName: 'ConfidentialLevel'
  })
  confidentialLevel: ConfidentialLevel;

  @ApiProperty({ description: 'The creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'The last update timestamp' })
  updatedAt: Date;
}

// Snake case to camel case mapping for database results
export const confidentialAccessControlColumnMap = {
  id: 'id',
  position: 'position',
  confidential_level: 'confidentialLevel',
  created_at: 'createdAt',
  updated_at: 'updatedAt',
};

// Camel case to snake case mapping for database inserts
export const confidentialAccessControlReverseColumnMap = {
  id: 'id',
  position: 'position',
  confidentialLevel: 'confidential_level',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
}; 