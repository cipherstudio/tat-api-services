import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { MenuItemsAccessRepository } from '../repositories/menu-items-access.repository';
import { MenuItemsAccess } from '../entities/menu-items-access.entity';
import { CreateMenuItemsAccessDto } from '../dto/create-menu-items-access.dto';
import { UpdateMenuItemsAccessDto } from '../dto/update-menu-items-access.dto';
import { QueryMenuItemsAccessDto } from '../dto/query-menu-items-access.dto';
import { PaginatedResult } from '../../../common/interfaces/pagination.interface';

@Injectable()
export class MenuItemsAccessService {
  constructor(
    private readonly menuItemsAccessRepository: MenuItemsAccessRepository,
  ) {}

  async create(createDto: CreateMenuItemsAccessDto): Promise<MenuItemsAccess> {
    // ตรวจสอบว่า key_name ซ้ำหรือไม่
    const existingByKeyName = await this.menuItemsAccessRepository.findByKeyName(
      createDto.key_name,
    );
    if (existingByKeyName) {
      throw new ConflictException('Key name already exists');
    }

    return await this.menuItemsAccessRepository.create(createDto);
  }

  async findAll(
    query: QueryMenuItemsAccessDto,
  ): Promise<PaginatedResult<MenuItemsAccess>> {
    return await this.menuItemsAccessRepository.findWithPaginationAndSearch(
      query,
    );
  }

  async findOne(id: number): Promise<MenuItemsAccess> {
    const menuItem = await this.menuItemsAccessRepository.findById(id);
    if (!menuItem) {
      throw new NotFoundException('Menu item not found');
    }
    return menuItem;
  }

  async findByKeyName(keyName: string): Promise<MenuItemsAccess> {
    const menuItem = await this.menuItemsAccessRepository.findByKeyName(keyName);
    if (!menuItem) {
      throw new NotFoundException('Menu item not found');
    }
    return menuItem;
  }

  async findByParentKey(parentKey: string): Promise<MenuItemsAccess[]> {
    return await this.menuItemsAccessRepository.findByParentKey(parentKey);
  }

  async findActiveMenuItems(): Promise<MenuItemsAccess[]> {
    return await this.menuItemsAccessRepository.findActiveMenuItems();
  }

  async findActiveMenuItemsByAdmin(isAdmin: boolean): Promise<MenuItemsAccess[]> {
    return await this.menuItemsAccessRepository.findActiveMenuItemsByAdmin(isAdmin);
  }

  async findMenuHierarchy(): Promise<MenuItemsAccess[]> {
    return await this.menuItemsAccessRepository.findMenuHierarchy();
  }

  async update(
    id: number,
    updateDto: UpdateMenuItemsAccessDto,
  ): Promise<MenuItemsAccess> {
    const existing = await this.findOne(id);

    // ตรวจสอบ key_name ซ้ำ (ถ้ามีการเปลี่ยนแปลง)
    if (updateDto.key_name && updateDto.key_name !== existing.key_name) {
      const existingByKeyName =
        await this.menuItemsAccessRepository.findByKeyName(updateDto.key_name);
      if (existingByKeyName && existingByKeyName.id !== id) {
        throw new ConflictException('Key name already exists');
      }
    }

    return await this.menuItemsAccessRepository.update(id, updateDto);
  }

  async remove(id: number): Promise<void> {
    const existing = await this.findOne(id);
    if (!existing) {
      throw new NotFoundException('Menu item not found');
    }
    await this.menuItemsAccessRepository.delete(id);
  }
} 