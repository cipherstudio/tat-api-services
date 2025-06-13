import { ApiProperty } from '@nestjs/swagger';

export class Currency {
  @ApiProperty({ description: 'รหัสประจำสกุลเงิน (Primary Key)' })
  id: number;

  @ApiProperty({ description: 'ชื่อสกุลเงินภาษาไทย เช่น บาทประเทศไทย' })
  currencyTh: string;

  @ApiProperty({ description: 'ชื่อย่อสกุลเงินภาษาไทย เช่น บาท' })
  currencyCodeTh: string;

  @ApiProperty({ description: 'ชื่อสกุลเงินภาษาอังกฤษ เช่น Thai Baht' })
  currencyEn: string;

  @ApiProperty({ description: 'ชื่อย่อสกุลเงินภาษาอังกฤษ เช่น THB' })
  currencyCodeEn: string;
}

export const currencyColumnMap = {
  id: 'id',
  currency_th: 'currencyTh',
  currency_code_th: 'currencyCodeTh',
  currency_en: 'currencyEn',
  currency_code_en: 'currencyCodeEn',
};

export const currencyReverseColumnMap = {
  id: 'id',
  currencyTh: 'currency_th',
  currencyCodeTh: 'currency_code_th',
  currencyEn: 'currency_en',
  currencyCodeEn: 'currency_code_en',
};
