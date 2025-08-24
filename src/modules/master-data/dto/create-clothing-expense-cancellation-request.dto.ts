import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty, IsOptional, IsString, IsArray, IsEnum } from 'class-validator';

export class CreateClothingExpenseCancellationRequestDto {
  @ApiProperty({ description: 'Approval ID' })
  @IsNumber()
  @IsNotEmpty()
  approval_id: number;

  @ApiProperty({ description: 'Attachment ID', required: false })
  @IsNumber()
  @IsOptional()
  attachment_id?: number;

  @ApiProperty({ description: 'Comment', required: false })
  @IsString()
  @IsOptional()
  comment?: string;

  @ApiProperty({ description: 'Creator code' })
  @IsString()
  @IsNotEmpty()
  creator_code: string;

  @ApiProperty({ description: 'Creator name' })
  @IsString()
  @IsNotEmpty()
  creator_name: string;

  @ApiProperty({ description: 'Status', enum: ['pending', 'approved', 'rejected'], default: 'pending' })
  @IsEnum(['pending', 'approved', 'rejected'])
  @IsOptional()
  status?: 'pending' | 'approved' | 'rejected';

  @ApiProperty({ description: 'Selected staff IDs array', required: false, type: [Number] })
  @IsArray()
  @IsOptional()
  selected_staff_ids?: number[];
}
