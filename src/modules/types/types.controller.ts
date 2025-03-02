import { Controller, Get, Version } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TypeDefinition } from './interfaces/type-definition.interface';
import { TypesService } from './types.service';

@Controller('types')
@ApiTags('Types')
export class TypesController {
  constructor(private readonly typesService: TypesService) {}

  @Get()
  @Version('1')
  @ApiOperation({ summary: 'Get all TypeScript types' })
  @ApiResponse({
    status: 200,
    description: 'Returns all TypeScript types from the API',
    type: Object,
  })
  async getAllTypes(): Promise<Record<string, TypeDefinition>> {
    return this.typesService.getAllTypes();
  }

  @Get('modules')
  @Version('1')
  @ApiOperation({ summary: 'Get available modules' })
  @ApiResponse({
    status: 200,
    description: 'Returns list of available modules',
    type: [String],
  })
  async getModules(): Promise<string[]> {
    return this.typesService.getModules();
  }

  @Get('dto')
  @Version('1')
  @ApiOperation({ summary: 'Get all DTO types' })
  @ApiResponse({
    status: 200,
    description: 'Returns all DTO types from the API',
    type: Object,
  })
  async getDtoTypes(): Promise<Record<string, TypeDefinition>> {
    return this.typesService.getDtoTypes();
  }

  @Get('entities')
  @Version('1')
  @ApiOperation({ summary: 'Get all entity types' })
  @ApiResponse({
    status: 200,
    description: 'Returns all entity types from the API',
    type: Object,
  })
  async getEntityTypes(): Promise<Record<string, TypeDefinition>> {
    return this.typesService.getEntityTypes();
  }

  @Get('interfaces')
  @Version('1')
  @ApiOperation({ summary: 'Get all interface types' })
  @ApiResponse({
    status: 200,
    description: 'Returns all interface types from the API',
    type: Object,
  })
  async getInterfaceTypes(): Promise<Record<string, TypeDefinition>> {
    return this.typesService.getInterfaceTypes();
  }
}
