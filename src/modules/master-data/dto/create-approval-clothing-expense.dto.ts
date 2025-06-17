import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

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

  @ApiProperty({ description: 'Work end date', required: false })
  @IsOptional()
  @IsString()
  work_end_date?: string;

  @ApiProperty({
    description: 'Approval accommodation expense ID',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  approval_accommodation_expense_id?: number;

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
}
