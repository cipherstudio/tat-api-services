import { IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ApprovalDateRangeDto {
  @ApiProperty({ 
    description: 'Start date of the range',
    required: true,
    example: '2024-03-20'
  })
  @IsDateString()
  start: string;

  @ApiProperty({ 
    description: 'End date of the range',
    required: true,
    example: '2024-03-25'
  })
  @IsDateString()
  end: string;
} 