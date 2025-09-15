import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateReportSettingsDto {
  @ApiProperty({ description: 'ชื่อรายงาน', example: 'รายงานการเบิกจ่ายค่าจัดประชุม' })
  @IsString()
  @IsNotEmpty()
  reportName: string;

  @ApiProperty({ description: 'ตัวแปร', example: 'report-meet-header-number' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: 'ค่าการตั้งค่า', example: '๖๕' })
  @IsString()
  @IsNotEmpty()
  value: string;
}
