import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateApprovalClothingExpenseDto {
  @ApiProperty({ description: 'Clothing file checked status', required: false })
  @IsOptional()
  @IsBoolean()
  clothing_file_checked?: boolean;

  @ApiProperty({ description: 'Clothing amount', required: false })
  @IsOptional()
  @IsNumber()
  clothing_amount?: number;

  @ApiProperty({ description: 'Clothing reason', required: false })
  @IsOptional()
  @IsString()
  clothing_reason?: string;

  @ApiProperty({ description: 'Reporting date', required: false })
  @IsOptional()
  @IsString()
  reporting_date?: string;

  @ApiProperty({ description: 'Next claim date', required: false })
  @IsOptional()
  @IsString()
  next_claim_date?: string;

  @ApiProperty({ description: 'Work start date', required: false })
  @IsOptional()
  @IsString()
  work_start_date?: string;

  @ApiProperty({ description: 'Work end date', required: false })
  @IsOptional()
  @IsString()
  work_end_date?: string;

  // @ApiProperty({
  //   description: 'Approval accommodation expense ID',
  //   required: false,
  // })
  // @IsOptional()
  // @IsNumber()
  // approval_accommodation_expense_id?: number;

  @ApiProperty({ description: 'Staff member ID', required: false })
  @IsOptional()
  @IsNumber()
  staff_member_id?: number;

  @ApiProperty({ description: 'Approval ID', required: false })
  @IsOptional()
  @IsNumber()
  approval_id?: number;

  @ApiProperty({ description: 'Employee code', required: false })
  @IsOptional()
  @IsNumber()
  employee_code?: number;

  @ApiProperty({ description: 'Increment ID', required: false })
  @IsOptional()
  @IsString()
  increment_id?: string;

  @ApiProperty({ description: 'Destination country', required: false })
  @IsOptional()
  @IsString()
  destination_country?: string;

  @ApiProperty({
    description: 'Manual document title (rows without approval_id)',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  manual_document_title?: string;

  @ApiProperty({
    description: 'Manual travel type (rows without approval_id)',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  manual_travel_type?: string;

  @ApiProperty({
    description: 'Manual requestor employee code',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  manual_requestor_code?: string;

  @ApiProperty({ description: 'Manual requestor name', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  manual_requestor_name?: string;

  @ApiProperty({ description: 'Manual requestor position', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  manual_requestor_position?: string;
}
