import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateReportTravellerDto {
  @ApiProperty({ example: 'RPT-2024-001' })
  // @IsNotEmpty()
  @IsOptional()
  @IsNumber()
  report_id?: number;

  @ApiProperty({ example: 'John Doe' })
  // @IsNotEmpty()
  @IsOptional()
  @IsString()
  name: string;

  @ApiProperty({ example: 'Manager' })
  @IsOptional()
  @IsString()
  position?: string;

  @ApiProperty({ example: 'Senior' })
  @IsOptional()
  @IsString()
  level?: string;

  @ApiProperty({ example: 'Official' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({ example: 'EMP001' })
  @IsOptional()
  @IsString()
  traveller_code?: string;
}
