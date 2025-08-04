import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { MenuItemsAccessService } from '../services/menu-items-access.service';
import { CreateMenuItemsAccessDto } from '../dto/create-menu-items-access.dto';
import { UpdateMenuItemsAccessDto } from '../dto/update-menu-items-access.dto';
import { QueryMenuItemsAccessDto } from '../dto/query-menu-items-access.dto';
import { MenuItemsAccess } from '../entities/menu-items-access.entity';
import { PaginatedResult } from '../../../common/interfaces/pagination.interface';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('Menu Items Access')
@Controller('menu-items-access')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class MenuItemsAccessController {
  constructor(
    private readonly menuItemsAccessService: MenuItemsAccessService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new menu item' })
  @ApiResponse({
    status: 201,
    description: 'Menu item created successfully',
  })
  @ApiResponse({
    status: 409,
    description: 'Key name already exists',
  })
  @ApiBody({
    type: CreateMenuItemsAccessDto,
    examples: {
      example1: {
        value: {
          key_name: 'dashboard',
          title: 'หน้าแรก',
          parent_key: null,
          is_active: true,
          is_admin: false,
        },
      },
    },
  })
  async create(
    @Body() createDto: CreateMenuItemsAccessDto,
  ): Promise<MenuItemsAccess> {
    return await this.menuItemsAccessService.create(createDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all menu items with pagination and filters',
  })
  @ApiResponse({
    status: 200,
    description: 'Menu items retrieved successfully',
  })
  async findAll(
    @Query() query: QueryMenuItemsAccessDto,
  ): Promise<PaginatedResult<MenuItemsAccess>> {
    return await this.menuItemsAccessService.findAll(query);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get all active menu items' })
  @ApiResponse({
    status: 200,
    description: 'Active menu items retrieved successfully',
  })
  async findActiveMenuItems(): Promise<MenuItemsAccess[]> {
    return await this.menuItemsAccessService.findActiveMenuItems();
  }

  @Get('active/admin/:isAdmin')
  @ApiOperation({ summary: 'Get active menu items by admin status' })
  @ApiResponse({
    status: 200,
    description: 'Active menu items retrieved successfully',
  })
  async findActiveMenuItemsByAdmin(
    @Param('isAdmin') isAdmin: string,
  ): Promise<MenuItemsAccess[]> {
    return await this.menuItemsAccessService.findActiveMenuItemsByAdmin(
      isAdmin === 'true',
    );
  }

  @Get('hierarchy')
  @ApiOperation({ summary: 'Get menu hierarchy' })
  @ApiResponse({
    status: 200,
    description: 'Menu hierarchy retrieved successfully',
  })
  async findMenuHierarchy(): Promise<MenuItemsAccess[]> {
    return await this.menuItemsAccessService.findMenuHierarchy();
  }

  @Get('parent/:parentKey')
  @ApiOperation({ summary: 'Get menu items by parent key' })
  @ApiResponse({
    status: 200,
    description: 'Menu items retrieved successfully',
  })
  async findByParentKey(
    @Param('parentKey') parentKey: string,
  ): Promise<MenuItemsAccess[]> {
    return await this.menuItemsAccessService.findByParentKey(parentKey);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get menu item by ID' })
  @ApiResponse({
    status: 200,
    description: 'Menu item retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Menu item not found' })
  async findOne(@Param('id') id: string): Promise<MenuItemsAccess> {
    return await this.menuItemsAccessService.findOne(+id);
  }

  @Get('key/:keyName')
  @ApiOperation({ summary: 'Get menu item by key name' })
  @ApiResponse({
    status: 200,
    description: 'Menu item retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Menu item not found' })
  async findByKeyName(
    @Param('keyName') keyName: string,
  ): Promise<MenuItemsAccess> {
    return await this.menuItemsAccessService.findByKeyName(keyName);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update menu item' })
  @ApiResponse({
    status: 200,
    description: 'Menu item updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Menu item not found' })
  @ApiResponse({
    status: 409,
    description: 'Key name already exists',
  })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateMenuItemsAccessDto,
  ): Promise<MenuItemsAccess> {
    console.log(updateDto);
    return await this.menuItemsAccessService.update(+id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete menu item' })
  @ApiResponse({
    status: 204,
    description: 'Menu item deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Menu item not found' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.menuItemsAccessService.remove(+id);
  }
}
