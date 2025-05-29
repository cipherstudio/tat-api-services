import { ApiProperty } from '@nestjs/swagger';

export class Places {
  @ApiProperty({ description: 'The unique identifier of the place' })
  id: number;

  @ApiProperty({ description: 'The name of the place' })
  name: string;

  @ApiProperty({ description: 'The creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'The last update timestamp' })
  updatedAt: Date;
}

// Snake case to camel case mapping for database results
export const placesColumnMap = {
  id: 'id',
  name: 'name',
  created_at: 'createdAt',
  updated_at: 'updatedAt',
};

// Camel case to snake case mapping for database inserts
export const placesReverseColumnMap = {
  id: 'id',
  name: 'name',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
}; 