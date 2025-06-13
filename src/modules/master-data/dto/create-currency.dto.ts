import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCurrencyDto {
  @ApiProperty({ description: 'ชื่อสกุลเงินภาษาไทย เช่น บาทประเทศไทย' })
  @IsString()
  @IsNotEmpty()
  currencyTh: string;

  @ApiProperty({ description: 'ชื่อย่อสกุลเงินภาษาไทย เช่น บาท' })
  @IsString()
  @IsNotEmpty()
  currencyCodeTh: string;

  @ApiProperty({ description: 'ชื่อสกุลเงินภาษาอังกฤษ เช่น Thai Baht' })
  @IsString()
  @IsNotEmpty()
  currencyEn: string;

  @ApiProperty({ description: 'ชื่อย่อสกุลเงินภาษาอังกฤษ เช่น THB' })
  @IsString()
  @IsNotEmpty()
  currencyCodeEn: string;
}
