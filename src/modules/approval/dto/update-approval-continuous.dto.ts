import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, IsNumber, IsDateString } from 'class-validator';

export class UpdateApprovalContinuousDto {
  @ApiProperty({
    description: 'Employee code',
    example: '66019',
    required: false
  })
  @IsOptional()
  @IsString()
  employeeCode?: string;

  @ApiProperty({
    description: 'Signer name',
    example: 'นางสาว พิชญา แสงธูป',
    required: false
  })
  @IsOptional()
  @IsString()
  signerName?: string;

  @ApiProperty({
    description: 'Signer date',
    example: '2025-07-04',
    required: false
  })
  @IsOptional()
  @IsDateString()
  signerDate?: string;

  @ApiProperty({
    description: 'Document ending',
    example: 'ขอแสดงความนับถือเป็นอย่างสูง',
    required: false
  })
  @IsOptional()
  @IsString()
  documentEnding?: string;

  @ApiProperty({
    description: 'Document ending wording',
    example: 'ขอแสดงความนับถือเป็นอย่างสูง 123',
    required: false
  })
  @IsOptional()
  @IsString()
  documentEndingWording?: string;

  @ApiProperty({
    description: 'Use file signature',
    example: false,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  useFileSignature?: boolean;

  @ApiProperty({
    description: 'Signature attachment ID',
    example: 1,
    required: false
  })
  @IsOptional()
  @IsNumber()
  signatureAttachmentId?: number;

  @ApiProperty({
    description: 'Use system signature',
    example: false,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  useSystemSignature?: boolean;

  @ApiProperty({
    description: 'Comments',
    example: 'รายละเอียดความเห็น',
    required: false
  })
  @IsOptional()
  @IsString()
  comments?: string;

  @ApiProperty({
    description: 'Approval continuous status code',
    example: 'APPROVED',
    required: false
  })
  @IsOptional()
  @IsString()
  statusCode?: string;
} 