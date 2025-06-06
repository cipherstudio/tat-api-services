import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { DisbursementsupportingService } from './disbursementsupporting.service';
import { CreateDisbursementSupportingDocumentTypeDto } from './dto/create-disbursement-supporting-document-type.dto';
import { CreateDisbursementSupportingFormDto } from './dto/create-disbursement-supporting-form.dto';
import { CreateDisbursementSupportingQuestionDto } from './dto/create-disbursement-supporting-question.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { UpdateDisbursementSupportingFormDto } from './dto/update-disbursement-supporting-form.dto';

@ApiTags('Disbursement Supporting')
@Controller('disbursement-supporting')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class DisbursementsupportingController {
  constructor(private readonly service: DisbursementsupportingService) {}

  // Document Types
  @Post('document-type')
  @ApiOperation({
    summary: 'สร้างประเภทเอกสาร',
    description: 'สร้างประเภทเอกสารประกอบการเบิกจ่าย',
  })
  @ApiBody({ type: CreateDisbursementSupportingDocumentTypeDto })
  @ApiResponse({ status: 201, description: 'สร้างประเภทเอกสารสำเร็จ' })
  createDocumentType(@Body() dto: CreateDisbursementSupportingDocumentTypeDto) {
    return this.service.createDocumentType(dto);
  }
  @Get('document-type')
  @ApiOperation({
    summary: 'ดึงรายการประเภทเอกสาร',
    description: 'ดึงข้อมูลประเภทเอกสารประกอบการเบิกจ่ายทั้งหมด',
  })
  @ApiResponse({ status: 200, description: 'สำเร็จ' })
  findAllDocumentTypes() {
    return this.service.findAllDocumentTypes();
  }
  @Get('document-type/:id')
  @ApiOperation({
    summary: 'ดึงประเภทเอกสารตาม ID',
    description: 'ดึงข้อมูลประเภทเอกสารตามรหัส',
  })
  @ApiResponse({ status: 200, description: 'สำเร็จ' })
  findDocumentTypeById(@Param('id', ParseIntPipe) id: number) {
    return this.service.findDocumentTypeById(id);
  }

  // Forms
  @Post('form')
  @ApiOperation({
    summary: 'สร้างฟอร์ม',
    description: 'สร้างฟอร์มสำหรับเอกสารประกอบการเบิกจ่าย',
  })
  @ApiBody({ type: CreateDisbursementSupportingFormDto })
  @ApiResponse({ status: 201, description: 'สร้างฟอร์มสำเร็จ' })
  createForm(@Body() dto: CreateDisbursementSupportingFormDto) {
    return this.service.createForm(dto);
  }
  @Get('form')
  @ApiOperation({
    summary: 'ดึงรายการฟอร์ม',
    description: 'ดึงข้อมูลฟอร์มทั้งหมด',
  })
  @ApiResponse({ status: 200, description: 'สำเร็จ' })
  findAllForms() {
    return this.service.findAllForms();
  }
  @Get('form/:id')
  @ApiOperation({
    summary: 'ดึงฟอร์มตาม ID',
    description: 'ดึงข้อมูลฟอร์มตามรหัส',
  })
  @ApiResponse({ status: 200, description: 'สำเร็จ' })
  findFormById(@Param('id', ParseIntPipe) id: number) {
    return this.service.findFormById(id);
  }
  @Get('form/by-document-type/:documentTypeId')
  @ApiOperation({
    summary: 'ดึงฟอร์มตามประเภทเอกสาร',
    description: 'ดึงข้อมูลฟอร์มทั้งหมดที่อยู่ในประเภทเอกสารที่ระบุ',
  })
  @ApiResponse({ status: 200, description: 'สำเร็จ' })
  findFormsByDocumentType(
    @Param('documentTypeId', ParseIntPipe) documentTypeId: number,
  ) {
    return this.service.findFormsByDocumentType(documentTypeId);
  }
  @Patch('form/:id')
  @ApiOperation({
    summary: 'อัปเดตฟอร์ม',
    description: 'อัปเดตข้อมูลฟอร์มสำหรับเอกสารประกอบการเบิกจ่าย',
  })
  @ApiBody({ type: UpdateDisbursementSupportingFormDto })
  @ApiResponse({ status: 200, description: 'อัปเดตฟอร์มสำเร็จ' })
  updateForm(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDisbursementSupportingFormDto,
  ) {
    return this.service.updateForm(id, dto);
  }

  // Questions
  @Post('question')
  @ApiOperation({
    summary: 'สร้างคำถาม',
    description: 'สร้างคำถามสำหรับฟอร์มเอกสารประกอบการเบิกจ่าย',
  })
  @ApiBody({ type: CreateDisbursementSupportingQuestionDto })
  @ApiResponse({ status: 201, description: 'สร้างคำถามสำเร็จ' })
  createQuestion(@Body() dto: CreateDisbursementSupportingQuestionDto) {
    return this.service.createQuestion(dto);
  }
  @Get('question')
  @ApiOperation({
    summary: 'ดึงรายการคำถาม',
    description: 'ดึงข้อมูลคำถามทั้งหมด',
  })
  @ApiResponse({ status: 200, description: 'สำเร็จ' })
  findAllQuestions() {
    return this.service.findAllQuestions();
  }
  @Get('question/:id')
  @ApiOperation({
    summary: 'ดึงคำถามตาม ID',
    description: 'ดึงข้อมูลคำถามตามรหัส',
  })
  @ApiResponse({ status: 200, description: 'สำเร็จ' })
  findQuestionById(@Param('id', ParseIntPipe) id: number) {
    return this.service.findQuestionById(id);
  }
  @Get('question/by-form/:formId')
  @ApiOperation({
    summary: 'ดึงคำถามตามฟอร์ม',
    description: 'ดึงข้อมูลคำถามทั้งหมดที่อยู่ในฟอร์มที่ระบุ',
  })
  @ApiResponse({ status: 200, description: 'สำเร็จ' })
  findQuestionsByForm(@Param('formId', ParseIntPipe) formId: number) {
    return this.service.findQuestionsByForm(formId);
  }
}
