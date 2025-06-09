import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateApprovalStatusDto {
  @ApiProperty({ description: 'Status of the approval', required: true })
  @IsNotEmpty()
  @IsString()
  status: string;
} 