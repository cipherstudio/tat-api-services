import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDateString, IsEnum, IsString, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { EmployeeDestinationDto } from './employee-destination.dto';

export class CheckClothingExpenseEligibilityDto {
  @ApiProperty({
    description: 'Type of travel',
    example: 'international',
  })
  @IsString()
  travelType: string;

  @ApiProperty({
    description: 'Work start date',
    example: '2025-04-01',
  })
  @IsDateString()
  workStartDate: string;

  @ApiProperty({
    description: 'Approval ID to check (optional)',
    example: 123,
    required: false,
  })
  @IsOptional()
  approval_id?: number;

  @ApiProperty({
    description: 'List of employees with their destinations',
    type: [EmployeeDestinationDto],
    example: [
      {
        employeeCode: 38801,
        destinationTable: 'countries',
        destinationId: 1
      },
      {
        employeeCode: 66019,
        destinationTable: 'tatOffices',
        destinationId: 1
      }
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EmployeeDestinationDto)
  employees: EmployeeDestinationDto[];
} 