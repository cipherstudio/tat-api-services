import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class EmployeeDestinationDto {
  @ApiProperty({
    description: 'Employee code',
    example: 38801,
    type: Number,
  })
  @IsNumber()
  employeeCode: number;

  @ApiProperty({
    description: 'Destination table name',
    example: 'countries',
    enum: ['countries', 'tatOffices'],
    type: String,
  })
  @IsString()
  destinationTable: string;

  @ApiProperty({
    description: 'Destination ID',
    example: 1,
    type: Number,
  })
  @IsNumber()
  destinationId: number;
}