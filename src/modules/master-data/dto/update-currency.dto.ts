import { PartialType } from '@nestjs/mapped-types';
import { CreateCurrencyDto } from './create-currency.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCurrencyDto extends PartialType(CreateCurrencyDto) {
  @ApiProperty({
    description: 'ชื่อสกุลเงินภาษาไทย เช่น บาทประเทศไทย',
    required: false,
  })
  currencyTh?: string;

  @ApiProperty({
    description: 'ชื่อย่อสกุลเงินภาษาไทย เช่น บาท',
    required: false,
  })
  currencyCodeTh?: string;

  @ApiProperty({
    description: 'ชื่อสกุลเงินภาษาอังกฤษ เช่น Thai Baht',
    required: false,
  })
  currencyEn?: string;

  @ApiProperty({
    description: 'ชื่อย่อสกุลเงินภาษาอังกฤษ เช่น THB',
    required: false,
  })
  currencyCodeEn?: string;
}
