import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ApprovalContentDto {
  @ApiProperty({ 
    description: 'Detail of the approval content',
    required: true,
    example: 'Meeting with client in Tokyo office'
  })
  @IsString()
  detail: string;
} 