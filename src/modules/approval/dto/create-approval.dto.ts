import { IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for creating a new approval
 * @TypeProperty({
 *   category: 'dto',
 *   description: 'DTO for creating a new approval'
 * })
 */
export class CreateApprovalDto {
  @ApiProperty({ description: 'Reference to another approval', required: false })
  @IsOptional()
  @IsNumber()
  approvalRef?: number;

  // Form 1 fields
  @ApiProperty({ description: 'Record type', required: false })
  @IsOptional()
  @IsString()
  recordType?: string;

  @ApiProperty({ description: 'The name of the employee', required: false })
  @IsOptional()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Employee code', required: false })
  @IsOptional()
  @IsString()
  employeeCode?: string;

  @ApiProperty({ description: 'Travel type', required: false })
  @IsOptional()
  @IsString()
  travelType?: string;

  @ApiProperty({ description: 'International sub option', required: false })
  @IsOptional()
  @IsString()
  internationalSubOption?: string;

  @ApiProperty({ description: 'Work start date', required: false })
  @IsOptional()
  @IsString()
  workStartDate?: string;

  @ApiProperty({ description: 'Work end date', required: false })
  @IsOptional()
  @IsString()
  workEndDate?: string;

  @ApiProperty({ description: 'Start country', required: false })
  @IsOptional()
  @IsString()
  startCountry?: string;

  @ApiProperty({ description: 'End country', required: false })
  @IsOptional()
  @IsString()
  endCountry?: string;

  @ApiProperty({ description: 'Remarks', required: false })
  @IsOptional()
  @IsString()
  remarks?: string;

  @ApiProperty({ description: 'Number of travelers', required: false })
  @IsOptional()
  @IsString()
  numTravelers?: string;

  @ApiProperty({ description: 'Document number', required: false })
  @IsOptional()
  @IsString()
  documentNo?: string;

  @ApiProperty({ description: 'Document telephone', required: false })
  @IsOptional()
  @IsString()
  documentTel?: string;

  @ApiProperty({ description: 'Document to', required: false })
  @IsOptional()
  @IsString()
  documentTo?: string;

  @ApiProperty({ description: 'Document title', required: false })
  @IsOptional()
  @IsString()
  documentTitle?: string;
}
