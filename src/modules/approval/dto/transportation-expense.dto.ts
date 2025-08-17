import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TransportationOutboundDto {
  @ApiProperty({
    description: 'ต้นทาง',
    example: 'Bangkok'
  })
  @IsString()
  origin: string;

  @ApiProperty({
    description: 'ปลายทาง',
    example: 'Chiang Mai'
  })
  @IsString()
  destination: string;

  @ApiProperty({
    description: 'จำนวนเที่ยว',
    example: 2
  })
  @IsNumber()
  trips: number;

  @ApiProperty({
    description: 'ค่าใช้จ่ายต่อเที่ยว',
    example: 500
  })
  @IsNumber()
  expense: number;

  @ApiProperty({
    description: 'ยอดรวม',
    example: 1000
  })
  @IsNumber()
  total: number;
}

export class TransportationInboundDto {
  @ApiProperty({
    description: 'ต้นทาง',
    example: 'Chiang Mai'
  })
  @IsString()
  origin: string;

  @ApiProperty({
    description: 'ปลายทาง',
    example: 'Bangkok'
  })
  @IsString()
  destination: string;

  @ApiProperty({
    description: 'จำนวนเที่ยว',
    example: 2
  })
  @IsNumber()
  trips: number;

  @ApiProperty({
    description: 'ค่าใช้จ่ายต่อเที่ยว',
    example: 400
  })
  @IsNumber()
  expense: number;

  @ApiProperty({
    description: 'ยอดรวม',
    example: 800
  })
  @IsNumber()
  total: number;
}

export class TransportationExpenseDto {
  @ApiProperty({
    description: 'ประเภทการเดินทาง',
    example: 'roundtrip'
  })
  @IsString()
  travelType: string;

  @ApiProperty({
    description: 'ประเภทค่าใช้จ่าย',
    example: 'bangkok_to_bangkok'
  })
  @IsString()
  expenseType: string;

  @ApiProperty({
    description: 'วิธีการเดินทาง',
    example: 'both',
    enum: ['outbound', 'inbound', 'both']
  })
  @IsEnum(['outbound', 'inbound', 'both'])
  travelMethod: string;

  @ApiProperty({
    description: 'ข้อมูลขาออก',
    type: TransportationOutboundDto,
    required: false
  })
  @IsOptional()
  outbound?: TransportationOutboundDto;

  @ApiProperty({
    description: 'ข้อมูลขาเข้า',
    type: TransportationInboundDto,
    required: false
  })
  @IsOptional()
  inbound?: TransportationInboundDto;

  @ApiProperty({
    description: 'ยอดรวมทั้งหมด',
    example: 1800
  })
  @IsNumber()
  totalAmount: number;
} 