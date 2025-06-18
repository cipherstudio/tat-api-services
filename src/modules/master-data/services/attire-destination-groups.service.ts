import { Injectable, NotFoundException } from '@nestjs/common';
import { RedisCacheService } from '../../cache/redis-cache.service';
import { UpdateAttireDestinationGroupsDto } from '../dto/update-attire-destination-groups.dto';
import { PaginatedResult } from '../../../common/interfaces/pagination.interface';
import { AttireDestinationGroupsRepository } from '../repositories/attire-destination-groups.repository';
import { AttireDestinationGroups } from '../entities/attire-destination-groups.entity';
import { AttireDestinationGroupsQueryDto } from '../dto/attire-destination-groups-query.dto';
import { CreateAttireDestinationGroupsDto } from '../dto/create-attire-destination-groups.dto';

@Injectable()
export class AttireDestinationGroupsService {
  private readonly CACHE_PREFIX = 'attire_destination_groups';
  private readonly CACHE_TTL = 3600; // 1 hour

  constructor(
    private readonly attireDestinationGroupsRepository: AttireDestinationGroupsRepository,
    private readonly redisCacheService: RedisCacheService,
  ) {}

  private generateCacheKey(id: number): string {
    return this.redisCacheService.generateKey(this.CACHE_PREFIX, id);
  }

  private generateListCacheKey(): string {
    return this.redisCacheService.generateListKey(this.CACHE_PREFIX);
  }

  private generateAssignmentTypeCacheKey(type: string): string {
    return `${this.CACHE_PREFIX}:assignment_type:${type}`;
  }

  private async invalidateCache(id: number): Promise<void> {
    await this.redisCacheService.del(this.generateCacheKey(id));
  }

  private async invalidateListCache(): Promise<void> {
    await this.redisCacheService.del(this.generateListCacheKey());
    // Also invalidate assignment type caches
    await this.redisCacheService.del(this.generateAssignmentTypeCacheKey('TEMPORARY'));
    await this.redisCacheService.del(this.generateAssignmentTypeCacheKey('PERMANENT'));
  }

  async findAll(query: AttireDestinationGroupsQueryDto): Promise<PaginatedResult<AttireDestinationGroups>> {
    const { 
      page = 1, 
      limit = 10, 
      orderBy = 'id', 
      orderDir = 'asc', 
      searchTerm, 
      ...conditions 
    } = query;

    // For complex queries with relations, we'll skip caching to avoid complexity
    // In production, you might want to implement more sophisticated caching strategies

    const where: any = {};

    // Add other conditions
    Object.entries(conditions).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        where[key] = value;
      }
    });

    const result = await this.attireDestinationGroupsRepository.findWithPaginationAndSearch(
      page,
      limit,
      where,
      orderBy,
      orderDir,
      searchTerm,
    );

    return result;
  }

  async findById(id: number): Promise<AttireDestinationGroups> {
    const cacheKey = this.generateCacheKey(id);
    const cachedGroup = await this.redisCacheService.get<AttireDestinationGroups>(cacheKey);
    if (cachedGroup) {
      return cachedGroup;
    }

    const group = await this.attireDestinationGroupsRepository.findById(id);
    if (!group) {
      throw new NotFoundException(`Attire destination group with ID ${id} not found`);
    }

    await this.redisCacheService.set(cacheKey, group, this.CACHE_TTL);
    return group;
  }

  async findByAssignmentType(assignmentType: string): Promise<AttireDestinationGroups[]> {
    const cacheKey = this.generateAssignmentTypeCacheKey(assignmentType);
    const cachedGroups = await this.redisCacheService.get<AttireDestinationGroups[]>(cacheKey);
    if (cachedGroups) {
      return cachedGroups;
    }

    const groups = await this.attireDestinationGroupsRepository.findByAssignmentType(assignmentType);
    await this.redisCacheService.set(cacheKey, groups, this.CACHE_TTL);
    return groups;
  }

  async findAllWithCountries(): Promise<AttireDestinationGroups[]> {
    const cacheKey = this.generateListCacheKey();
    const cachedGroups = await this.redisCacheService.get<AttireDestinationGroups[]>(cacheKey);
    if (cachedGroups) {
      return cachedGroups;
    }

    const groups = await this.attireDestinationGroupsRepository.findAllWithCountries();
    await this.redisCacheService.set(cacheKey, groups, this.CACHE_TTL);
    return groups;
  }

  async create(createDto: CreateAttireDestinationGroupsDto): Promise<AttireDestinationGroups> {
    const result = await this.attireDestinationGroupsRepository.create(createDto);
    await this.invalidateListCache();
    return result;
  }

  async update(id: number, updateDto: UpdateAttireDestinationGroupsDto): Promise<AttireDestinationGroups> {
    const existing = await this.attireDestinationGroupsRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Attire destination group with ID ${id} not found`);
    }

    const result = await this.attireDestinationGroupsRepository.update(id, updateDto);
    await this.invalidateCache(id);
    await this.invalidateListCache();
    return result;
  }

  async remove(id: number): Promise<void> {
    const existing = await this.attireDestinationGroupsRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Attire destination group with ID ${id} not found`);
    }

    await this.attireDestinationGroupsRepository.delete(id);
    await this.invalidateCache(id);
    await this.invalidateListCache();
  }

  async addCountriesToGroup(groupId: number, countryIds: number[]): Promise<AttireDestinationGroups> {
    const existing = await this.attireDestinationGroupsRepository.findById(groupId);
    if (!existing) {
      throw new NotFoundException(`Attire destination group with ID ${groupId} not found`);
    }

    // Get current country IDs
    const currentCountryIds = existing.countries.map(c => c.id);
    
    // Merge with new country IDs (remove duplicates)
    const uniqueCountryIds = [...new Set([...currentCountryIds, ...countryIds])];

    const result = await this.attireDestinationGroupsRepository.update(groupId, { 
      countryIds: uniqueCountryIds 
    } as any);
    
    await this.invalidateCache(groupId);
    await this.invalidateListCache();
    return result;
  }

  async removeCountriesFromGroup(groupId: number, countryIds: number[]): Promise<AttireDestinationGroups> {
    const existing = await this.attireDestinationGroupsRepository.findById(groupId);
    if (!existing) {
      throw new NotFoundException(`Attire destination group with ID ${groupId} not found`);
    }

    // Get current country IDs and remove specified ones
    const currentCountryIds = existing.countries.map(c => c.id);
    const remainingCountryIds = currentCountryIds.filter(id => !countryIds.includes(id));

    const result = await this.attireDestinationGroupsRepository.update(groupId, { 
      countryIds: remainingCountryIds 
    } as any);
    
    await this.invalidateCache(groupId);
    await this.invalidateListCache();
    return result;
  }
} 