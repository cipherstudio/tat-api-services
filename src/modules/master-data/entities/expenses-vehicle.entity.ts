import { ApiProperty } from '@nestjs/swagger';

export class ExpensesVehicle {
  @ApiProperty({ description: 'The unique identifier of the expense vehicle' })
  id: number;

  @ApiProperty({ description: 'The code of the expense vehicle' })
  code: string;

  @ApiProperty({ description: 'The title of the expense vehicle' })
  title: string;

  @ApiProperty({ description: 'The rate of the expense vehicle' })
  rate: number;

  @ApiProperty({ description: 'The creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'The last update timestamp' })
  updatedAt: Date;
}

// Snake case to camel case mapping for database results
export const expensesVehicleColumnMap = {
  id: 'id',
  code: 'code',
  title: 'title',
  rate: 'rate',
  created_at: 'createdAt',
  updated_at: 'updatedAt',
};

// Camel case to snake case mapping for database inserts
export const expensesVehicleReverseColumnMap = {
  id: 'id',
  code: 'code',
  title: 'title',
  rate: 'rate',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
}; 