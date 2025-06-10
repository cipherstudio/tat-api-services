import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ApprovalBudgetDto {
  @ApiProperty({
    description: 'ประเภทงบประมาณ',
    example: 'งบประมาณรายจ่ายประจำปี',
    required: false
  })
  @IsString()
  @IsOptional()
  budget_type?: string;

  @ApiProperty({
    description: 'ประเภทรายการ',
    example: 'ค่าอุปกรณ์',
    required: false
  })
  @IsString()
  @IsOptional()
  item_type?: string;

  @ApiProperty({
    description: 'รหัสการจอง',
    example: 'RES001',
    required: false
  })
  @IsString()
  @IsOptional()
  reservation_code?: string;

  @ApiProperty({
    description: 'แผนก',
    example: 'แผนกเทคโนโลยีสารสนเทศ',
    required: false
  })
  @IsString()
  @IsOptional()
  department?: string;

  @ApiProperty({
    description: 'รหัสงบประมาณ',
    example: 'BUD001',
    required: false
  })
  @IsString()
  @IsOptional()
  budget_code?: string;
} 