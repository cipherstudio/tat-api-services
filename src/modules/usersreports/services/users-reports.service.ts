import { Injectable } from '@nestjs/common';
import { UsersReportsQueryDto } from '../dto/users-reports-query.dto';
import { UsersReportsRepository } from '../repositories/users-reports.repository';
import { RedisCacheService } from '../../cache/redis-cache.service';

@Injectable()
export class UsersReportsService {
  private readonly CACHE_PREFIX = 'users_reports';
  private readonly CACHE_TTL = 3600; // 1 hour in seconds

  constructor(
    private readonly usersReportsRepository: UsersReportsRepository,
    private readonly cacheService: RedisCacheService,
  ) {}

  /**
   * รายงานการเดินทาง
   */
  async getCommuteReport(query: UsersReportsQueryDto) {
    const cacheKey = `${this.CACHE_PREFIX}:commute:${JSON.stringify(query)}`;
    
    // Try to get from cache first
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      return JSON.parse(cached as string);
    }

    // Get data from repository
    const result = await this.usersReportsRepository.findCommuteReports(query);
    
    const response = {
      data: result.data,
      total: result.meta.total,
      meta: result.meta,
      query
    };

    // Cache the result
    await this.cacheService.set(cacheKey, JSON.stringify(response), this.CACHE_TTL);
    
    return response;
  }

  /**
   * รายงานการจัดทำรายงานเดินทางปฏิบัติงาน
   */
  async getWorkReport(query: UsersReportsQueryDto) {
    const cacheKey = `${this.CACHE_PREFIX}:work:${JSON.stringify(query)}`;
    
    // Try to get from cache first
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      return JSON.parse(cached as string);
    }

    // Get data from repository
    const result = await this.usersReportsRepository.findWorkReports(query);
    
    const response = {
      data: result.data,
      total: result.meta.total,
      meta: result.meta,
      query
    };

    // Cache the result
    await this.cacheService.set(cacheKey, JSON.stringify(response), this.CACHE_TTL);
    
    return response;
  }

  /**
   * รายงานการใช้งบประมาณ
   */
  async getExpenditureReport(query: UsersReportsQueryDto) {
    const cacheKey = `${this.CACHE_PREFIX}:expenditure:${JSON.stringify(query)}`;
    
    // Try to get from cache first
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      return JSON.parse(cached as string);
    }

    // Get data from repository
    const result = await this.usersReportsRepository.findExpenditureReports(query);
    
    const response = {
      data: result.data,
      total: result.meta.total,
      meta: result.meta,
      query
    };

    // Cache the result
    await this.cacheService.set(cacheKey, JSON.stringify(response), this.CACHE_TTL);
    
    return response;
  }

  /**
   * รายงานประวัติการเบิกค่าเครื่องแต่งกาย
   */
  async getClothingReport(query: UsersReportsQueryDto) {
    const cacheKey = `${this.CACHE_PREFIX}:clothing:${JSON.stringify(query)}`;
    
    // Try to get from cache first
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      return JSON.parse(cached as string);
    }

    // Get data from repository
    const result = await this.usersReportsRepository.findClothingReports(query);
    
    const response = {
      data: result.data,
      total: result.meta.total,
      meta: result.meta,
      query
    };

    // Cache the result
    await this.cacheService.set(cacheKey, JSON.stringify(response), this.CACHE_TTL);
    
    return response;
  }

  /**
   * รายงานประวัติการเข้าใช้งานระบบ
   */
  async getActivityReport(query: UsersReportsQueryDto) {
    const cacheKey = `${this.CACHE_PREFIX}:activity:${JSON.stringify(query)}`;
    
    // Try to get from cache first
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      return JSON.parse(cached as string);
    }

    // Get data from repository
    const result = await this.usersReportsRepository.findActivityReports(query);
    
    const response = {
      data: result.data,
      total: result.meta.total,
      meta: result.meta,
      query
    };

    // Cache the result
    await this.cacheService.set(cacheKey, JSON.stringify(response), this.CACHE_TTL);
    
    return response;
  }
} 