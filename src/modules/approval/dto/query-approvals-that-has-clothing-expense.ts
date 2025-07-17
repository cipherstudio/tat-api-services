import { IsOptional, IsString } from 'class-validator';
import { QueryApprovalDto } from './query-approval.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryApprovalsThatHasClothingExpenseDto extends QueryApprovalDto {
  @ApiPropertyOptional({
    description: 'Include inactive approvals',
    default: false,
  })
  @IsOptional()
  @IsString()
  documentTitle?: string;

  @ApiPropertyOptional({
    description: 'Approval request start date',
    default: '',
  })
  @IsOptional()
  @IsString()
  approvalRequestStartDate?: string;

  @ApiPropertyOptional({
    description: 'Approval request end date',
    default: '',
  })
  @IsOptional()
  @IsString()
  approvalRequestEndDate?: string;

  @ApiPropertyOptional({
    description: 'Increment ID',
    default: '',
  })
  @IsOptional()
  @IsString()
  incrementId?: string;

  @ApiPropertyOptional({
    description: 'Urgency level',
    default: '',
  })
  @IsOptional()
  @IsString()
  urgencyLevel?: string;

  @ApiPropertyOptional({
    description: 'Confidentiality level',
    default: '',
  })
  @IsOptional()
  @IsString()
  confidentialityLevel?: string;
}
