import { IsString, IsOptional, IsNumber, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ApprovalDateRangeDto } from './approval-date-range.dto';
import { ApprovalContentDto } from './approval-content.dto';
import { ApprovalTripEntryDto } from './approval-trip-entry.dto';
import { ApprovalStaffMemberDto } from './approval-staff-member.dto';
//import { ApprovalWorkLocationDto } from './approval-work-location.dto';

/**
 * DTO for updating a approval
 * @TypeProperty({
 *   category: 'dto',
 *   description: 'DTO for updating a approval',
 *   extends: ['CreateApprovalDto']
 * })
 */
export class UpdateApprovalDto {
  @ApiProperty({ 
    description: 'Reference to another approval',
    required: false,
    example: 123
  })
  @IsOptional()
  @IsNumber()
  approvalRef?: number;

  @ApiProperty({ 
    description: 'Record type',
    required: false,
    example: 'TRAVEL'
  })
  @IsOptional()
  @IsString()
  recordType?: string;

  @ApiProperty({ 
    description: 'The name of the employee',
    required: false,
    example: 'John Doe'
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ 
    description: 'Employee code',
    required: false,
    example: 'EMP001'
  })
  @IsOptional()
  @IsString()
  employeeCode?: string;

  @ApiProperty({ 
    description: 'Travel type',
    required: false,
    example: 'DOMESTIC'
  })
  @IsOptional()
  @IsString()
  travelType?: string;

  @ApiProperty({ 
    description: 'International sub option',
    required: false,
    example: 'ASIA'
  })
  @IsOptional()
  @IsString()
  internationalSubOption?: string;

  @ApiProperty({ 
    description: 'Work start date',
    required: false,
    example: '2024-03-20'
  })
  @IsOptional()
  @IsString()
  workStartDate?: string;

  @ApiProperty({ 
    description: 'Work end date',
    required: false,
    example: '2024-03-25'
  })
  @IsOptional()
  @IsString()
  workEndDate?: string;

  @ApiProperty({ 
    description: 'Start country',
    required: false,
    example: 'Thailand'
  })
  @IsOptional()
  @IsString()
  startCountry?: string;

  @ApiProperty({ 
    description: 'End country',
    required: false,
    example: 'Japan'
  })
  @IsOptional()
  @IsString()
  endCountry?: string;

  @ApiProperty({ 
    description: 'Remarks',
    required: false,
    example: 'Business trip for annual meeting'
  })
  @IsOptional()
  @IsString()
  remarks?: string;

  @ApiProperty({ 
    description: 'Number of travelers',
    required: false,
    example: '2'
  })
  @IsOptional()
  @IsString()
  numTravelers?: string;

  @ApiProperty({ 
    description: 'Document number',
    required: false,
    example: 'DOC-2024-001'
  })
  @IsOptional()
  @IsString()
  documentNo?: string;

  @ApiProperty({ 
    description: 'Document telephone',
    required: false,
    example: '0812345678'
  })
  @IsOptional()
  @IsString()
  documentTel?: string;

  @ApiProperty({ 
    description: 'Document to',
    required: false,
    example: 'HR Department'
  })
  @IsOptional()
  @IsString()
  documentTo?: string;

  @ApiProperty({ 
    description: 'Document title',
    required: false,
    example: 'Business Trip Request'
  })
  @IsOptional()
  @IsString()
  documentTitle?: string;

  @ApiProperty({ 
    description: 'Travel date ranges',
    type: [ApprovalDateRangeDto],
    required: false,
    example: [
      {
        start: '2024-03-20',
        end: '2024-03-25'
      },
      {
        start: '2024-04-01',
        end: '2024-04-05'
      }
    ]
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApprovalDateRangeDto)
  travelDateRanges?: ApprovalDateRangeDto[];

  @ApiProperty({ 
    description: 'Approval contents',
    type: [ApprovalContentDto],
    required: false,
    example: [
      {
        detail: 'Meeting with client in Tokyo office'
      },
      {
        detail: 'Visit manufacturing plant in Osaka'
      }
    ]
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApprovalContentDto)
  approvalContents?: ApprovalContentDto[];

  @ApiProperty({
    description: 'Trip entries for the approval',
    type: [ApprovalTripEntryDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApprovalTripEntryDto)
  tripEntries?: ApprovalTripEntryDto[];

  @ApiProperty({
    description: 'Staff members for the approval',
    type: [ApprovalStaffMemberDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApprovalStaffMemberDto)
  staffMembers?: ApprovalStaffMemberDto[];
}
