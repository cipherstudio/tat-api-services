import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Query,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { CurrencyService } from '../services/currency.service';
import { CreateCurrencyDto } from '../dto/create-currency.dto';
import { UpdateCurrencyDto } from '../dto/update-currency.dto';
import { CurrencyQueryDto } from '../dto/currency-query.dto';
import {
  ApiQuery,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('Master Data')
@Controller('master-data/currencies')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  @Post()
  @ApiOperation({
    summary: 'สร้างข้อมูลสกุลเงิน',
    description: 'สร้างข้อมูลสกุลเงินใหม่',
  })
  @ApiResponse({ status: 201, description: 'สร้างข้อมูลสกุลเงินสำเร็จ' })
  create(@Body() createCurrencyDto: CreateCurrencyDto) {
    return this.currencyService.create(createCurrencyDto);
  }

  @Get()
  @ApiOperation({
    summary: 'ดึงข้อมูลสกุลเงินทั้งหมด',
    description: 'ค้นหา/ดึงข้อมูลสกุลเงินทั้งหมดแบบแบ่งหน้า',
  })
  @ApiResponse({ status: 200, description: 'ดึงข้อมูลสกุลเงินสำเร็จ' })
  @ApiQuery({
    name: 'page',
    type: Number,
    required: false,
    description: 'หน้าที่ต้องการ',
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    description: 'จำนวนรายการต่อหน้า',
  })
  @ApiQuery({
    name: 'orderBy',
    type: String,
    required: false,
    description: 'เรียงตามฟิลด์',
  })
  @ApiQuery({
    name: 'orderDir',
    type: String,
    required: false,
    description: 'ทิศทางการเรียง',
  })
  @ApiQuery({
    name: 'currencyTh',
    type: String,
    required: false,
    description: 'ชื่อสกุลเงินภาษาไทย',
  })
  @ApiQuery({
    name: 'currencyCodeTh',
    type: String,
    required: false,
    description: 'ชื่อย่อสกุลเงินภาษาไทย',
  })
  @ApiQuery({
    name: 'currencyEn',
    type: String,
    required: false,
    description: 'ชื่อสกุลเงินภาษาอังกฤษ',
  })
  @ApiQuery({
    name: 'currencyCodeEn',
    type: String,
    required: false,
    description: 'ชื่อย่อสกุลเงินภาษาอังกฤษ',
  })
  @ApiQuery({
    name: 'searchTerm',
    type: String,
    required: false,
    description: 'ค้นหาด้วยคำค้น',
  })
  findAll(
    @Query('page', new ValidationPipe({ transform: true })) page?: number,
    @Query('limit', new ValidationPipe({ transform: true })) limit?: number,
    @Query('orderBy') orderBy?: string,
    @Query('orderDir') orderDir?: 'ASC' | 'DESC',
    @Query('currencyTh') currencyTh?: string,
    @Query('currencyCodeTh') currencyCodeTh?: string,
    @Query('currencyEn') currencyEn?: string,
    @Query('currencyCodeEn') currencyCodeEn?: string,
    @Query('searchTerm') searchTerm?: string,
  ) {
    const queryOptions: Partial<CurrencyQueryDto> = {
      page,
      limit,
      orderBy,
      orderDir,
      currencyTh,
      currencyCodeTh,
      currencyEn,
      currencyCodeEn,
      searchTerm,
      offset: 0,
    };
    return this.currencyService.findAll(queryOptions);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'ดึงข้อมูลสกุลเงินตามรหัส',
    description: 'ดึงข้อมูลสกุลเงินตามรหัส (id)',
  })
  @ApiResponse({ status: 200, description: 'ดึงข้อมูลสกุลเงินสำเร็จ' })
  @ApiResponse({ status: 404, description: 'ไม่พบข้อมูลสกุลเงิน' })
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.currencyService.findById(id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'แก้ไขข้อมูลสกุลเงิน',
    description: 'แก้ไขข้อมูลสกุลเงินตามรหัส (id)',
  })
  @ApiResponse({ status: 200, description: 'แก้ไขข้อมูลสกุลเงินสำเร็จ' })
  @ApiResponse({ status: 404, description: 'ไม่พบข้อมูลสกุลเงิน' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCurrencyDto: UpdateCurrencyDto,
  ) {
    return this.currencyService.update(id, updateCurrencyDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'ลบข้อมูลสกุลเงิน',
    description: 'ลบข้อมูลสกุลเงินตามรหัส (id)',
  })
  @ApiResponse({ status: 204, description: 'ลบข้อมูลสกุลเงินสำเร็จ' })
  @ApiResponse({ status: 404, description: 'ไม่พบข้อมูลสกุลเงิน' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.currencyService.remove(id);
  }
}
