import { Injectable } from '@nestjs/common';
import { RedisCacheService } from '../../cache/redis-cache.service';
import { OrganizationStructureRepository } from '../repositories/organization-structure.repository';
import { QueryOrganizationStructureDto } from '../dto/query-organization-structure.dto';
import {
  OrganizationStructure,
  OrganizationStructurePaginate,
} from '../entities/organization-structure.entity';

@Injectable()
export class OrganizationStructureService {
  constructor(
    private readonly organizationStructureRepository: OrganizationStructureRepository,
    private readonly cacheService: RedisCacheService,
  ) {}

  async getOrganizationStructure(
    query: Partial<QueryOrganizationStructureDto>,
  ): Promise<OrganizationStructurePaginate> {
    // ตั้งค่า default values
    const queryWithDefaults: QueryOrganizationStructureDto = {
      includeEmployees: query.includeEmployees ?? true,
      onlyWithEmployees: query.onlyWithEmployees ?? false,
      mainOrganizationCode: query.mainOrganizationCode,
      departmentCode: query.departmentCode,
      divisionCode: query.divisionCode,
      sectionCode: query.sectionCode,
      searchTerm: query.searchTerm,
      employeeSearchTerm: query.employeeSearchTerm,
      employeePage: query.employeePage ?? 1,
      employeeLimit: query.employeeLimit ?? 10,
      page: query.page ?? 1,
      limit: query.limit ?? 10,
      orderBy: query.orderBy ?? 'id',
      orderDir: query.orderDir ?? 'asc',
      offset: query.offset ?? 0,
    };

    // สร้าง cache key จาก query parameters
    const cacheKey = this.buildCacheKey(queryWithDefaults);

    // ลองดึงจาก cache ก่อน
    const cached = await this.cacheService.get<OrganizationStructure>(cacheKey);
    if (cached) {
      return {
        data: cached,
        meta: {
          total: cached.totalEmployees,
          timestamp: new Date(),
        },
      };
    }

    // ดึงข้อมูลจากฐานข้อมูล
    const structure =
      await this.organizationStructureRepository.getOrganizationStructure(
        queryWithDefaults,
      );

    // เก็บใน cache (cache นาน 30 นาที)
    await this.cacheService.set(cacheKey, structure, 1800);

    return {
      data: structure,
      meta: {
        total: structure.totalEmployees,
        timestamp: new Date(),
      },
    };
  }

  async getOrganizationByCode(
    code: string,
  ): Promise<OrganizationStructurePaginate> {
    const query: Partial<QueryOrganizationStructureDto> = {};

    // ตรวจสอบว่าเป็นรหัสระดับไหน
    if (this.isMainOrganization(code)) {
      query.mainOrganizationCode = code;
    } else if (this.isDepartment(code)) {
      query.departmentCode = code;
    } else if (this.isDivision(code)) {
      query.divisionCode = code;
    } else if (this.isSection(code)) {
      query.sectionCode = code;
    } else {
      throw new Error('Invalid organization code format');
    }

    query.includeEmployees = true;

    const result = await this.getOrganizationStructure(query);
    return result;
  }

  async searchOrganizations(
    searchTerm: string,
  ): Promise<OrganizationStructurePaginate> {
    const query: Partial<QueryOrganizationStructureDto> = {
      searchTerm,
      includeEmployees: true,
      onlyWithEmployees: false,
    };

    return this.getOrganizationStructure(query);
  }

  async getOrganizationsWithEmployees(): Promise<OrganizationStructurePaginate> {
    const query: Partial<QueryOrganizationStructureDto> = {
      includeEmployees: true,
      onlyWithEmployees: true,
    };

    return this.getOrganizationStructure(query);
  }

  async getStatistics(): Promise<{
    totalMainOrganizations: number;
    totalDepartments: number;
    totalDivisions: number;
    totalSections: number;
    totalEmployees: number;
  }> {
    const cacheKey = 'organization_statistics';

    // ลองดึงจาก cache ก่อน
    const cached = await this.cacheService.get<{
      totalMainOrganizations: number;
      totalDepartments: number;
      totalDivisions: number;
      totalSections: number;
      totalEmployees: number;
    }>(cacheKey);
    if (cached) {
      return cached;
    }

    const query: Partial<QueryOrganizationStructureDto> = {
      includeEmployees: true,
    };

    const result = await this.getOrganizationStructure(query);
    const structure = result.data;

    const statistics = {
      totalMainOrganizations: structure.mainOrganizations.length,
      totalDepartments: structure.totalDepartments,
      totalDivisions: structure.totalDivisions,
      totalSections: structure.totalSections,
      totalEmployees: structure.totalEmployees,
    };

    // cache สถิตินาน 1 ชั่วโมง
    await this.cacheService.set(cacheKey, statistics, 3600);

    return statistics;
  }

  private buildCacheKey(query: QueryOrganizationStructureDto): string {
    const parts = ['org_structure'];

    if (query.mainOrganizationCode)
      parts.push(`main_${query.mainOrganizationCode}`);
    if (query.departmentCode) parts.push(`dept_${query.departmentCode}`);
    if (query.divisionCode) parts.push(`div_${query.divisionCode}`);
    if (query.sectionCode) parts.push(`sect_${query.sectionCode}`);
    if (query.searchTerm) parts.push(`search_${query.searchTerm}`);
    if (query.includeEmployees !== undefined)
      parts.push(`emp_${query.includeEmployees}`);
    if (query.onlyWithEmployees !== undefined)
      parts.push(`only_${query.onlyWithEmployees}`);
    if (query.employeeSearchTerm)
      parts.push(`emp_search_${query.employeeSearchTerm}`);
    if (query.employeePage !== undefined)
      parts.push(`emp_page_${query.employeePage}`);
    if (query.employeeLimit !== undefined)
      parts.push(`emp_limit_${query.employeeLimit}`);

    return parts.join('_');
  }

  // Helper methods สำหรับตรวจสอบประเภทของหน่วยงาน
  private isMainOrganization(code: string): boolean {
    return code.endsWith('00000') && code.length === 6;
  }

  private isDepartment(code: string): boolean {
    return (
      code.endsWith('0000') && !code.endsWith('00000') && code.length === 6
    );
  }

  private isDivision(code: string): boolean {
    return code.endsWith('00') && !code.endsWith('000') && code.length === 6;
  }

  private isSection(code: string): boolean {
    return !code.endsWith('00') && code.length === 6;
  }

  async clearCache(): Promise<void> {
    // ลบ cache ทั้งหมดที่เกี่ยวข้องกับ organization structure
    const pattern = 'org_structure*';
    await this.cacheService.del(pattern);
    await this.cacheService.del('organization_statistics');
  }
}
