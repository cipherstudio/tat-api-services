import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Res,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { CreateFilesDto } from './dto/create-files.dto';
import { UpdateFilesDto } from './dto/update-files.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiConsumes,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import * as fs from 'fs';

function fileDestination(req, file, cb) {
  let dest;
  if (file.mimetype.startsWith('image/')) {
    dest = path.join(process.cwd(), 'uploads', 'images');
  } else {
    dest = path.join(process.cwd(), 'uploads', 'documents');
  }
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  cb(null, dest);
}

function fileName(req, file, cb) {
  const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
  cb(null, uniqueName);
}

const multerOptions = {
  storage: diskStorage({
    destination: fileDestination,
    filename: fileName,
  }),
};

@ApiTags('Files')
@Controller('files')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post()
  @ApiOperation({
    summary: 'สร้างข้อมูลไฟล์',
    description: 'สร้างข้อมูลไฟล์ใหม่ในระบบ',
  })
  @ApiResponse({ status: 201, description: 'สร้างไฟล์สำเร็จ' })
  create(@Body() createFilesDto: CreateFilesDto) {
    return this.filesService.create(createFilesDto);
  }

  @Get()
  @ApiOperation({
    summary: 'ดึงรายการไฟล์ทั้งหมด',
    description: 'ดึงข้อมูลไฟล์ทั้งหมดในระบบ',
  })
  @ApiResponse({ status: 200, description: 'สำเร็จ' })
  findAll() {
    return this.filesService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'ดึงข้อมูลไฟล์ตาม ID',
    description: 'ดึงข้อมูลไฟล์ตามรหัส',
  })
  @ApiParam({ name: 'id', description: 'รหัสไฟล์' })
  @ApiResponse({ status: 200, description: 'สำเร็จ' })
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.filesService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'แก้ไขข้อมูลไฟล์',
    description: 'แก้ไขข้อมูลไฟล์ตามรหัส',
  })
  @ApiParam({ name: 'id', description: 'รหัสไฟล์' })
  @ApiResponse({ status: 200, description: 'แก้ไขไฟล์สำเร็จ' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFilesDto: UpdateFilesDto,
  ) {
    return this.filesService.update(id, updateFilesDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'ลบไฟล์', description: 'ลบไฟล์ตามรหัส' })
  @ApiParam({ name: 'id', description: 'รหัสไฟล์' })
  @ApiResponse({ status: 204, description: 'ลบไฟล์สำเร็จ' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.filesService.remove(id);
  }

  @Post('upload-single')
  @ApiOperation({
    summary: 'อัปโหลดไฟล์เดี่ยว',
    description: 'อัปโหลดไฟล์เดี่ยว (รองรับเอกสารและรูปภาพ)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'ไฟล์ที่ต้องการอัปโหลด',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'อัปโหลดไฟล์เดี่ยวสำเร็จ' })
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async uploadSingle(@UploadedFile() file: any) {
    return this.filesService.uploadSingleFile(file);
  }

  @Post('upload-multiple')
  @ApiOperation({
    summary: 'อัปโหลดไฟล์หลายไฟล์',
    description: 'อัปโหลดไฟล์หลายไฟล์พร้อมกัน (รองรับเอกสารและรูปภาพ)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
            description: 'ไฟล์ที่ต้องการอัปโหลด',
          },
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'อัปโหลดไฟล์หลายไฟล์สำเร็จ' })
  @UseInterceptors(FilesInterceptor('files', 10, multerOptions))
  async uploadMultiple(@UploadedFiles() files: any[]) {
    return this.filesService.uploadMultipleFiles(files);
  }

  @Get(':id/stream')
  @ApiOperation({
    summary: 'Stream ไฟล์',
    description: 'Stream ไฟล์ (เช่น สำหรับ preview หรือเปิดดูใน browser)',
  })
  @ApiParam({ name: 'id', description: 'รหัสไฟล์' })
  @ApiResponse({ status: 200, description: 'Stream ไฟล์สำเร็จ' })
  async streamFile(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const { stream, file } = await this.filesService.streamFile(id);
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader(
      'Content-Disposition',
      `inline; filename*=UTF-8''${encodeURIComponent(file.originalName)}`,
    );
    stream.pipe(res);
  }

  @Get(':id/download')
  @ApiOperation({
    summary: 'ดาวน์โหลดไฟล์',
    description: 'ดาวน์โหลดไฟล์ตามรหัส (รองรับชื่อไฟล์ภาษาไทย)',
  })
  @ApiParam({ name: 'id', description: 'รหัสไฟล์' })
  @ApiResponse({ status: 200, description: 'ดาวน์โหลดไฟล์สำเร็จ' })
  async downloadFile(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const { buffer, file } = await this.filesService.downloadFile(id);
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename*=UTF-8''${encodeURIComponent(file.originalName)}`,
    );
    res.send(buffer);
  }
}
