import { ApiProperty } from '@nestjs/swagger';

export class InternationalMovingAllowances {
  @ApiProperty({ description: 'Unique identifier' })
  id: number;

  @ApiProperty({ description: 'Office name' })
  office: string;

  @ApiProperty({ description: 'Currency' })
  currency: string;

  @ApiProperty({ description: 'Director salary' })
  directorSalary: number;

  @ApiProperty({ description: 'Deputy director salary' })
  deputyDirectorSalary: number;

  @ApiProperty({ description: 'Created at timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at timestamp' })
  updatedAt: Date;
}

export const internationalMovingAllowancesColumnMap = {
  id: 'id',
  office: 'office',
  currency: 'currency',
  directorSalary: 'director_salary',
  deputyDirectorSalary: 'deputy_director_salary',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
};

export const internationalMovingAllowancesReverseColumnMap = {
  id: 'id',
  office: 'office',
  currency: 'currency',
  director_salary: 'directorSalary',
  deputy_director_salary: 'deputyDirectorSalary',
  created_at: 'createdAt',
  updated_at: 'updatedAt',
}; 