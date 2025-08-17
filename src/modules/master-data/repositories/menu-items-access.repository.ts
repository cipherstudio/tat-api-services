import { Injectable } from '@nestjs/common';
import { KnexService } from '../../../database/knex-service/knex.service';
import { MenuItemsAccess } from '../entities/menu-items-access.entity';
import { KnexBaseRepository } from '../../../common/repositories/knex-base.repository';
import { QueryMenuItemsAccessDto } from '../dto/query-menu-items-access.dto';
import { PaginatedResult } from '../../../common/interfaces/pagination.interface';

@Injectable()
export class MenuItemsAccessRepository extends KnexBaseRepository<MenuItemsAccess> {
  constructor(knexService: KnexService) {
    super(knexService, 'menu_items_access');
  }

  async findWithPaginationAndSearch(
    query: QueryMenuItemsAccessDto,
  ): Promise<PaginatedResult<MenuItemsAccess>> {
    const { page = 1, limit = 10, ...filters } = query;
    const offset = (page - 1) * limit;

    let queryBuilder = this.knex('menu_items_access')
      .orderBy('created_at', 'desc');

    if (filters.key_name) {
      queryBuilder = queryBuilder.where(
        'key_name',
        'like',
        `%${filters.key_name}%`,
      );
    }

    if (filters.title) {
      queryBuilder = queryBuilder.where(
        'title',
        'like',
        `%${filters.title}%`,
      );
    }

    if (filters.parent_key) {
      queryBuilder = queryBuilder.where('parent_key', filters.parent_key);
    }

    if (filters.is_active !== undefined) {
      queryBuilder = queryBuilder.where('is_active', filters.is_active);
    }

    if (filters.is_admin !== undefined) {
      queryBuilder = queryBuilder.where('is_admin', filters.is_admin);
    }

    if (filters.searchTerm) {
      queryBuilder = queryBuilder.where(
        'key_name',
        'like',
        `%${filters.searchTerm}%`,
      );
      queryBuilder = queryBuilder.orWhere(
        'title',
        'like',
        `%${filters.searchTerm}%`,
      );
      queryBuilder = queryBuilder.orWhere(
        'parent_key',
        'like',
        `%${filters.searchTerm}%`,
      );
    }

    const totalCount = await queryBuilder.clone().count('* as count').first();
    const total = parseInt(totalCount.count as string);

    const data = await queryBuilder
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async findByKeyName(keyName: string): Promise<MenuItemsAccess | null> {
    const result = await this.knexService
      .knex('menu_items_access')
      .where('key_name', keyName)
      .first();

    return result || null;
  }

  async findByParentKey(parentKey: string): Promise<MenuItemsAccess[]> {
    return await this.knexService
      .knex('menu_items_access')
      .where('parent_key', parentKey)
      .where('is_active', true)
      .orderBy('created_at', 'asc');
  }

  async findActiveMenuItems(): Promise<MenuItemsAccess[]> {
    return await this.knexService
      .knex('menu_items_access')
      .where('is_active', true)
      .orderBy('created_at', 'asc');
  }

  async findActiveMenuItemsByAdmin(isAdmin: boolean): Promise<MenuItemsAccess[]> {
    return await this.knexService
      .knex('menu_items_access')
      .where('is_active', true)
      .where('is_admin', isAdmin)
      .orderBy('created_at', 'asc');
  }

  async findMenuHierarchy(): Promise<MenuItemsAccess[]> {
    return await this.knexService
      .knex('menu_items_access')
      .where('is_active', true)
      .orderBy('parent_key', 'asc')
      .orderBy('created_at', 'asc');
  }
} 