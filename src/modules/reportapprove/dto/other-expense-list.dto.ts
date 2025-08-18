import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsArray, IsUUID } from 'class-validator';

export class ReceiptDto {
  @ApiProperty({ example: '4f2f548a-cd56-425e-b8ac-ba91dec9fe7b' })
  @IsUUID()
  id: string;

  @ApiProperty({ example: 'test' })
  @IsString()
  detail: string;

  @ApiProperty({ example: 500 })
  @IsNumber()
  amount: number;
}

export class OtherExpenseListItemDto {
  @ApiProperty({ example: '6fc657d1-8ec2-47e4-a1b5-a40954984aab' })
  @IsUUID()
  id: string;

  @ApiProperty({ example: 'test' })
  @IsString()
  name: string;

  @ApiProperty({ example: 20000 })
  @IsNumber()
  requestAmount: number;

  @ApiProperty({ example: 500 })
  @IsNumber()
  actualAmount: number;

  @ApiProperty({ type: [ReceiptDto] })
  @IsArray()
  receipts: ReceiptDto[];
}
