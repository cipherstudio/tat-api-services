import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class CreateMeetRateDto {
  @ApiProperty({ description: 'Meeting type', example: 'การจัดประชุม 1' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ description: 'Food rate amount', example: 35000.00 })
  @IsNumber()
  @IsNotEmpty()
  food: number;

  @ApiProperty({ description: 'Snack rate amount', example: 15000.00 })
  @IsNumber()
  @IsNotEmpty()
  snack: number;
}
