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
  @ApiProperty({ 
    description: 'Reference to another approval', 
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsNumber()
  approvalRef?: number;

  // Form 1 fields
  @ApiProperty({ 
    description: 'Record type', 
    required: false, 
    example: 'owner' 
  })
  @IsOptional()
  @IsString()
  recordType?: string;

  @ApiProperty({ 
    description: 'The name of the employee', 
    required: false, 
    example: 'นายสมชาย สมหญิง' 
  })
  @IsOptional()
  @IsString()
  name: string;

  @ApiProperty({ 
    description: 'Employee code', 
    required: false, 
    example: '66019' 
  })
  @IsOptional()
  @IsString()
  employeeCode?: string;

  @ApiProperty({ 
    description: 'Travel type', 
    required: false, 
    example: 'temporary-international' 
  })
  @IsOptional()
  @IsString()
  travelType?: string;

  @ApiProperty({ 
    description: 'International sub option', 
    required: false, 
    example: '' 
  })
  @IsOptional()
  @IsString()
  internationalSubOption?: string;

  @ApiProperty({ description: 'Work start date', required: false, 
    example: '2025-01-01' 
  })
  @IsOptional()
  @IsString()
  workStartDate?: string;

  @ApiProperty({ description: 'Work end date', required: false, 
    example: '2025-01-01' 
  })
  @IsOptional()
  @IsString()
  workEndDate?: string;

  @ApiProperty({ description: 'Start country', required: false, 
    example: 'กานา' 
  })
  @IsOptional()
  @IsString()
  startCountry?: string;

  @ApiProperty({ description: 'End country', required: false, 
    example: 'กาตาร์' 
  })
  @IsOptional()
  @IsString()
  endCountry?: string;

  @ApiProperty({ description: 'Remarks', required: false, 
    example: 'รายละเอียดเหตุผล' 
  })
  @IsOptional()
  @IsString()
  remarks?: string;

  @ApiProperty({ description: 'Number of travelers', required: false, 
    example: 'single' 
  })
  @IsOptional()
  @IsString()
  numTravelers?: string;

  @ApiProperty({ description: 'Document number', required: false, 
    example: '1234567890' 
  })
  @IsOptional()
  @IsString()
  documentNo?: string;

  @ApiProperty({ description: 'Document number (เลขอ้างอิงงาน)', required: false,
    example: 'เลขอ้างอิงงาน 456/2567'
  })
  @IsOptional()
  @IsString()
  documentNumber?: string;

  @ApiProperty({ description: 'Document telephone', required: false, 
    example: '0812345678' 
  })
  @IsOptional()
  @IsString()
  documentTel?: string;

  @ApiProperty({ description: 'Document to', required: false, 
    example: 'นายสมชาย สมหญิง' 
  })
  @IsOptional()
  @IsString()
  documentTo?: string;

  @ApiProperty({ description: 'Document title', required: false, 
    example: 'รายละเอียดเอกสาร' 
  })
  @IsOptional()
  @IsString()
  documentTitle?: string;
}
