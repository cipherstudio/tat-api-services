import { Injectable, NotFoundException } from '@nestjs/common';
import { Files } from './entities/files.entity';
import { CreateFilesDto } from './dto/create-files.dto';
import { UpdateFilesDto } from './dto/update-files.dto';
import { RedisCacheService } from '../cache/redis-cache.service';
import { FilesRepository } from './repositories/files.repository';
import * as path from 'path';
import * as fs from 'fs';
import * as iconv from 'iconv-lite';

@Injectable()
export class FilesService {
  private readonly CACHE_PREFIX = 'files';
  private readonly CACHE_TTL = 3600; // 1 hour in seconds

  constructor(
    private readonly filesRepository: FilesRepository,
    private readonly cacheService: RedisCacheService,
  ) {}

  async create(createFilesDto: CreateFilesDto): Promise<Files> {
    const savedFiles = await this.filesRepository.create(createFilesDto);

    // Cache the new files
    await this.cacheService.set(
      this.cacheService.generateKey(this.CACHE_PREFIX, savedFiles.id),
      savedFiles,
      this.CACHE_TTL,
    );

    // Invalidate the list cache
    await this.cacheService.del(
      this.cacheService.generateListKey(this.CACHE_PREFIX),
    );

    return savedFiles;
  }

  async findAll(): Promise<Files[]> {
    // Try to get from cache first
    const cacheKey = this.cacheService.generateListKey(this.CACHE_PREFIX);
    const cachedResult = await this.cacheService.get<Files[]>(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    const result = await this.filesRepository.find();

    // Cache the result
    await this.cacheService.set(cacheKey, result, this.CACHE_TTL);

    return result;
  }

  async findById(id: number): Promise<Files> {
    // Try to get from cache first
    const cacheKey = this.cacheService.generateKey(this.CACHE_PREFIX, id);
    const cachedFiles = await this.cacheService.get<Files>(cacheKey);
    if (cachedFiles) {
      return cachedFiles;
    }

    const files = await this.filesRepository.findById(id);
    if (!files) {
      throw new NotFoundException(`Files with ID ${id} not found`);
    }

    // Cache the result
    await this.cacheService.set(cacheKey, files, this.CACHE_TTL);

    return files;
  }

  async update(id: number, updateFilesDto: UpdateFilesDto): Promise<Files> {
    const files = await this.findById(id);
    if (!files) {
      throw new NotFoundException(`Files with ID ${id} not found`);
    }

    await this.filesRepository.update(id, updateFilesDto);
    const updatedFiles = await this.findById(id);

    // Update cache
    const cacheKey = this.cacheService.generateKey(this.CACHE_PREFIX, id);
    await this.cacheService.set(cacheKey, updatedFiles, this.CACHE_TTL);

    // Invalidate the list cache
    await this.cacheService.del(
      this.cacheService.generateListKey(this.CACHE_PREFIX),
    );

    return updatedFiles;
  }

  async remove(id: number): Promise<void> {
    // Get file info before deleting from database
    const file = await this.filesRepository.findById(id);
    if (!file) {
      throw new NotFoundException(`Files with ID ${id} not found`);
    }

    // Delete from database first
    const result = await this.filesRepository.delete(id);
    if (!result) {
      throw new NotFoundException(`Files with ID ${id} not found`);
    }

    // Try to delete the physical file from disk
    if (file.path) {
      try {
        const absPath = path.join(process.cwd(), file.path);
        if (fs.existsSync(absPath)) {
          fs.unlinkSync(absPath);
        }
      } catch (error) {
        console.warn(`Warning: Failed to delete physical file ${file.path}:`, error.message);
        // Don't throw error here as the database record is already deleted
      }
    }

    // Remove from cache
    await this.cacheService.del(
      this.cacheService.generateKey(this.CACHE_PREFIX, id),
    );
    // Invalidate the list cache
    await this.cacheService.del(
      this.cacheService.generateListKey(this.CACHE_PREFIX),
    );
  }

  async uploadSingleFile(file: any): Promise<Files> {
    let originalName = file.originalname;
    // ถ้าชื่อไฟล์มีอักขระ mojibake ให้ลอง decode ใหม่ (latin1 -> utf8)
    if (/[à-ÿ]/.test(originalName)) {
      const buf = Buffer.from(originalName, 'latin1');
      originalName = iconv.decode(buf, 'utf8');
    }
    const fileRecord: CreateFilesDto = {
      originalName,
      fileName: path.basename(file.path),
      mimeType: file.mimetype,
      size: file.size,
      path: path.relative(process.cwd(), file.path),
    };
    return this.create(fileRecord);
  }

  async uploadMultipleFiles(files: any[]): Promise<Files[]> {
    const results: Files[] = [];
    for (const file of files) {
      results.push(await this.uploadSingleFile(file));
    }
    return results;
  }

  async streamFile(
    fileId: number,
  ): Promise<{ stream: fs.ReadStream; file: Files }> {
    const file = await this.filesRepository.findById(fileId);
    if (!file) {
      throw new NotFoundException(`Files with ID ${fileId} not found`);
    }
    const absPath = path.join(process.cwd(), file.path);
    if (!fs.existsSync(absPath)) {
      throw new NotFoundException('File not found on disk');
    }
    return { stream: fs.createReadStream(absPath), file };
  }

  async downloadFile(fileId: number): Promise<{ buffer: Buffer; file: Files }> {
    const file = await this.filesRepository.findById(fileId);
    if (!file) {
      throw new NotFoundException(`Files with ID ${fileId} not found`);
    }
    const absPath = path.join(process.cwd(), file.path);
    if (!fs.existsSync(absPath)) {
      throw new NotFoundException('File not found on disk');
    }
    const buffer = fs.readFileSync(absPath);
    return { buffer, file };
  }
}
