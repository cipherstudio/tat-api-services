import * as fs from 'fs';
import * as path from 'path';

// Helper function to capitalize first letter of string
const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export interface GenerateModuleOptions {
  name: string;
  includePagination?: boolean;
  includeAuth?: boolean;
  baseDir?: string;
}

export class ModuleGenerator {
  private moduleName: string;
  private moduleNameCapitalized: string;
  private baseDir: string;
  private modulePath: string;
  private includePagination: boolean;
  private includeAuth: boolean;
  private appModulePath: string = 'src/app.module.ts';

  constructor(options: GenerateModuleOptions) {
    this.moduleName = options.name.toLowerCase();
    this.moduleNameCapitalized = capitalize(this.moduleName);
    this.baseDir = options.baseDir || 'src/modules';
    this.modulePath = path.join(this.baseDir, this.moduleName);
    this.includePagination = options.includePagination || false;
    this.includeAuth = options.includeAuth || false;
  }

  public async generate(): Promise<void> {
    this.createDirectoryStructure();
    await this.generateFiles();

    // Register the module in app.module.ts if it's in the default location
    if (this.baseDir === 'src/modules') {
      await this.registerModuleInAppModule();
    }

    console.log(
      `✅ Module ${this.moduleNameCapitalized} generated successfully!`,
    );
  }

  private createDirectoryStructure(): void {
    const directories = [
      this.modulePath,
      path.join(this.modulePath, 'dto'),
      path.join(this.modulePath, 'entities'),
      path.join(this.modulePath, 'interfaces'),
      path.join(this.modulePath, 'repositories'),
    ];

    directories.forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  private async generateFiles(): Promise<void> {
    // Generate entity
    await this.generateEntity();

    // Generate DTOs
    await this.generateCreateDto();
    await this.generateUpdateDto();
    await this.generateQueryDto();

    // Generate interfaces if pagination is included
    if (this.includePagination) {
      await this.generateOptionsInterface();
    }

    // Generate repository
    await this.generateRepository();

    // Generate service
    await this.generateService();

    // Generate controller
    await this.generateController();

    // Generate module
    await this.generateModule();
  }

  private async generateEntity(): Promise<void> {
    const content = `import { ApiProperty } from '@nestjs/swagger';

export interface ${this.moduleNameCapitalized} {
  /**
   * The unique identifier for the ${this.moduleName}
   */
  id: number;

  /**
   * The name of the ${this.moduleName}
   */
  name: string;

  /**
   * Whether the ${this.moduleName} is active
   */
  isActive: boolean;

  /**
   * When the ${this.moduleName} was created
   */
  createdAt: Date;

  /**
   * When the ${this.moduleName} was last updated
   */
  updatedAt: Date;
}

// Snake case to camel case mapping for database results
export const ${this.moduleName}ColumnMap = {
  id: 'id',
  name: 'name',
  is_active: 'isActive',
  created_at: 'createdAt',
  updated_at: 'updatedAt',
};

// Camel case to snake case mapping for database inserts
export const ${this.moduleName}ReverseColumnMap = {
  id: 'id',
  name: 'name',
  isActive: 'is_active',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
};
`;

    await this.writeFile('entities', `${this.moduleName}.entity.ts`, content);
  }

  private async generateCreateDto(): Promise<void> {
    const content = `import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for creating a new ${this.moduleName}
 * @TypeProperty({
 *   category: 'dto',
 *   description: 'DTO for creating a new ${this.moduleName}'
 * })
 */
export class Create${this.moduleNameCapitalized}Dto {
  /**
   * The name of the ${this.moduleName}
   * @TypeProperty({
   *   type: 'string',
   *   isOptional: false,
   *   description: 'The name of the ${this.moduleName}',
   *   validations: {
   *     isString: true,
   *     minLength: 1
   *   }
   * })
   */
  @ApiProperty({ description: 'The name of the ${this.moduleName}' })
  @IsString()
  name: string;

  /**
   * Whether the ${this.moduleName} is active
   * @TypeProperty({
   *   type: 'boolean',
   *   isOptional: true,
   *   description: 'Whether the ${this.moduleName} is active',
   *   defaultValue: true,
   *   validations: {
   *     isBoolean: true
   *   }
   * })
   */
  @ApiProperty({ description: 'Whether the ${this.moduleName} is active', required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
`;

    await this.writeFile('dto', `create-${this.moduleName}.dto.ts`, content);
  }

  private async generateUpdateDto(): Promise<void> {
    const content = `import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { Create${this.moduleNameCapitalized}Dto } from './create-${this.moduleName}.dto';

/**
 * DTO for updating a ${this.moduleName}
 * @TypeProperty({
 *   category: 'dto',
 *   description: 'DTO for updating a ${this.moduleName}',
 *   extends: ['Create${this.moduleNameCapitalized}Dto']
 * })
 */
export class Update${this.moduleNameCapitalized}Dto extends PartialType(Create${this.moduleNameCapitalized}Dto) {}
`;

    await this.writeFile('dto', `update-${this.moduleName}.dto.ts`, content);
  }

  private async generateQueryDto(): Promise<void> {
    const content = `import { Transform, Type } from 'class-transformer';
    import { IsOptional, IsEnum, IsString, IsBoolean, IsDate, IsNumber, IsArray } from 'class-validator';
    import { ApiPropertyOptional } from '@nestjs/swagger';

    export class Query${this.moduleNameCapitalized}Dto {
      @ApiPropertyOptional({ description: 'Page number', default: 1 })
      @IsOptional()
      @IsNumber()
      @Type(() => Number)
      page?: number;

      @ApiPropertyOptional({ description: 'Number of items per page', default: 10 })
      @IsOptional()
      @IsNumber()
      @Type(() => Number)
      limit?: number;

      @ApiPropertyOptional({ description: 'Field to order by', default: 'createdAt' })
      @IsOptional()
      @IsString()
      orderBy?: string;

      @ApiPropertyOptional({ description: 'Order direction', enum: ['ASC', 'DESC'], default: 'DESC' })
      @IsOptional()
      @IsEnum(['ASC', 'DESC'])
      orderDir?: 'ASC' | 'DESC';

      @ApiPropertyOptional({ description: 'Include inactive ${this.moduleName}s', default: false })
      @IsOptional()
      @IsBoolean()
      @Transform(({ value }) => value === 'true')
      includeInactive?: boolean;

      @ApiPropertyOptional({ description: 'Filter by name (partial match)' })
      @IsOptional()
      @IsString()
      name?: string;

      @ApiPropertyOptional({ description: 'Filter by active status' })
      @IsOptional()
      @IsBoolean()
      @Transform(({ value }) => value === 'true')
      isActive?: boolean;

      @ApiPropertyOptional({ description: 'Search term for name' })
      @IsOptional()
      @IsString()
      searchTerm?: string;

      @ApiPropertyOptional({ description: 'Filter by creation date (after)' })
      @IsOptional()
      @Type(() => Date)
      @IsDate()
      createdAfter?: Date;

      @ApiPropertyOptional({ description: 'Filter by creation date (before)' })
      @IsOptional()
      @Type(() => Date)
      @IsDate()
      createdBefore?: Date;

      @ApiPropertyOptional({ description: 'Relations to include', type: [String] })
      @IsOptional()
      @IsArray()
      @IsString({ each: true })
      @Transform(({ value }) => (typeof value === 'string' ? value.split(',') : value))
      includes?: string[];
    }`;

    await this.writeFile('dto', `query-${this.moduleName}.dto.ts`, content);
  }

  private async generateOptionsInterface(): Promise<void> {
    const content = `import {
  BasePaginationOptions,
  BaseFilterOptions,
  BaseIncludeOptions,
  BaseQueryOptions,
} from '../../../common/interfaces/query-options.interface';

/**
 * ${this.moduleNameCapitalized}-specific filter options
 * @TypeProperty({
 *   category: 'interface',
 *   description: 'Filter options specific to ${this.moduleName}',
 *   extends: ['BaseFilterOptions']
 * })
 */
export interface ${this.moduleNameCapitalized}FilterOptions extends BaseFilterOptions {
  /**
   * Filter by ${this.moduleName} name (partial match)
   * @TypeProperty({
   *   type: 'string',
   *   isOptional: true,
   *   description: 'Filter by ${this.moduleName} name (partial match)'
   * })
   */
  name?: string;
}

/**
 * ${this.moduleNameCapitalized}-specific pagination options
 * @TypeProperty({
 *   category: 'interface',
 *   description: 'Pagination options specific to ${this.moduleName}',
 *   extends: ['BasePaginationOptions']
 * })
 */
export interface ${this.moduleNameCapitalized}PaginationOptions extends BasePaginationOptions {
  /**
   * Whether to include inactive ${this.moduleName}s in the results
   * @TypeProperty({
   *   type: 'boolean',
   *   isOptional: true,
   *   description: 'Whether to include inactive ${this.moduleName}s in the results',
   *   defaultValue: false
   * })
   */
  includeInactive?: boolean;
}

/**
 * ${this.moduleNameCapitalized}-specific include options
 * @TypeProperty({
 *   category: 'interface',
 *   description: 'Include options specific to ${this.moduleName}',
 *   extends: ['BaseIncludeOptions']
 * })
 */
export interface ${this.moduleNameCapitalized}IncludeOptions extends BaseIncludeOptions {}

/**
 * Combined query options for ${this.moduleName}
 * @TypeProperty({
 *   category: 'interface',
 *   description: 'Combined query options for ${this.moduleName}',
 *   extends: ['BaseQueryOptions']
 * })
 */
export interface ${this.moduleNameCapitalized}QueryOptions 
  extends ${this.moduleNameCapitalized}PaginationOptions,
    ${this.moduleNameCapitalized}FilterOptions,
    ${this.moduleNameCapitalized}IncludeOptions {}
`;

    await this.writeFile(
      'interfaces',
      `${this.moduleName}-options.interface.ts`,
      content,
    );
  }

  private async generateRepository(): Promise<void> {
    const content = `import { Injectable } from '@nestjs/common';
import { ${this.moduleNameCapitalized} } from '../entities/${this.moduleName}.entity';
import { KnexBaseRepository } from '../../../common/repositories/knex-base.repository';
import { KnexService } from '../../../database/knex-service/knex.service';
import { toCamelCase, toSnakeCase } from '../../../common/utils/case-mapping';

@Injectable()
export class ${this.moduleNameCapitalized}Repository extends KnexBaseRepository<${this.moduleNameCapitalized}> {
  constructor(knexService: KnexService) {
    super(knexService, '${this.moduleName}s');
  }

  async create(entity: Partial<${this.moduleNameCapitalized}>): Promise<${this.moduleNameCapitalized}> {
    const dbEntity = await toSnakeCase(entity);
    const created = await super.create(dbEntity);
    return await toCamelCase<${this.moduleNameCapitalized}>(created);
  }

  async update(id: number, entity: Partial<${this.moduleNameCapitalized}>): Promise<${this.moduleNameCapitalized}> {
    const dbEntity = await toSnakeCase(entity);
    const updated = await super.update(id, dbEntity);
    return await toCamelCase<${this.moduleNameCapitalized}>(updated);
  }

  async findById(id: number): Promise<${this.moduleNameCapitalized} | undefined> {
    const dbEntity = await super.findById(id);
    return dbEntity ? await toCamelCase<${this.moduleNameCapitalized}>(dbEntity) : undefined;
  }

  async findOne(conditions: Record<string, any>): Promise<${this.moduleNameCapitalized} | undefined> {
    const dbEntity = await super.findOne(conditions);
    return dbEntity ? await toCamelCase<${this.moduleNameCapitalized}>(dbEntity) : undefined;
  }

  async find(conditions: Record<string, any> = {}): Promise<${this.moduleNameCapitalized}[]> {
    const dbEntities = await super.find(conditions);
    return Promise.all(dbEntities.map(async (e) => await toCamelCase<${this.moduleNameCapitalized}>(e)));
  }

  async findWithPagination(
    page: number = 1,
    limit: number = 10,
    conditions: Record<string, any> = {},
    orderBy: string = 'id',
    direction: 'asc' | 'desc' = 'asc',
  ) {
    const result = await super.findWithPagination(page, limit, conditions, orderBy, direction);
    return {
      ...result,
      data: await Promise.all(result.data.map(async (e) => await toCamelCase<${this.moduleNameCapitalized}>(e))),
    };
  }

  // Add custom repository methods here as needed
}
`;

    await this.writeFile(
      'repositories',
      `${this.moduleName}.repository.ts`,
      content,
    );
  }

  private async generateService(): Promise<void> {
    const content = `import { Injectable, NotFoundException } from '@nestjs/common';
    import { ${this.moduleNameCapitalized} } from './entities/${this.moduleName}.entity';
    import { Create${this.moduleNameCapitalized}Dto } from './dto/create-${this.moduleName}.dto';
    import { Update${this.moduleNameCapitalized}Dto } from './dto/update-${this.moduleName}.dto';${
      this.includePagination
        ? `\nimport { ${this.moduleNameCapitalized}QueryOptions } from './interfaces/${this.moduleName}-options.interface';\nimport { PaginatedResult } from '../../../common/interfaces/pagination.interface';`
        : ''
    }
    import { RedisCacheService } from '../cache/redis-cache.service';
    import { ${this.moduleNameCapitalized}Repository } from './repositories/${this.moduleName}.repository';

    @Injectable()
    export class ${this.moduleNameCapitalized}Service {
      private readonly CACHE_PREFIX = '${this.moduleName}';
      private readonly CACHE_TTL = 3600; // 1 hour in seconds

      constructor(
        private readonly ${this.moduleName}Repository: ${this.moduleNameCapitalized}Repository,
        private readonly cacheService: RedisCacheService,
      ) {}

      async create(create${this.moduleNameCapitalized}Dto: Create${
        this.moduleNameCapitalized
      }Dto): Promise<${this.moduleNameCapitalized}> {
        const saved${this.moduleNameCapitalized} = await this.${
          this.moduleName
        }Repository.create(create${this.moduleNameCapitalized}Dto);

        // Cache the new ${this.moduleName}
        await this.cacheService.set(
          this.cacheService.generateKey(this.CACHE_PREFIX, saved${
            this.moduleNameCapitalized
          }.id),
          saved${this.moduleNameCapitalized},
          this.CACHE_TTL
        );

        // Invalidate the list cache
        await this.cacheService.del(this.cacheService.generateListKey(this.CACHE_PREFIX));

        return saved${this.moduleNameCapitalized};
      }

      async findAll(${
        this.includePagination
          ? `queryOptions?: ${this.moduleNameCapitalized}QueryOptions`
          : ''
      }): Promise<${
        this.includePagination
          ? `PaginatedResult<${this.moduleNameCapitalized}>`
          : `${this.moduleNameCapitalized}[]`
      }> {
        // Try to get from cache first
        const cacheKey = this.cacheService.generateListKey(this.CACHE_PREFIX);
        const cachedResult = await this.cacheService.get<${
          this.includePagination
            ? `PaginatedResult<${this.moduleNameCapitalized}>`
            : `${this.moduleNameCapitalized}[]`
        }>(cacheKey);
        if (cachedResult) {
          return cachedResult;
        }

        ${
          this.includePagination
            ? `const {
          page = 1,
          limit = 10,
          orderBy = 'createdAt',
          orderDir = 'DESC',
          includeInactive = false,
          name,
          isActive,
          searchTerm,
        } = queryOptions || {};

        // Prepare conditions
        const conditions: Record<string, any> = {};
        
        if (isActive !== undefined) {
          conditions.is_active = isActive;
        } else if (!includeInactive) {
          conditions.is_active = true;
        }

        if (name) {
          conditions.name = name;
        }

        // Convert orderBy from camelCase to snake_case if needed
        const dbOrderBy = orderBy === 'createdAt' ? 'created_at' : 
                         orderBy === 'updatedAt' ? 'updated_at' : 
                         orderBy === 'isActive' ? 'is_active' : orderBy;

        const result = await this.${this.moduleName}Repository.findWithPagination(
          page,
          limit,
          conditions,
          dbOrderBy,
          orderDir.toLowerCase() as 'asc' | 'desc'
        );

        // If we have a search term, filter results manually
        // This is a simple implementation - for production, you'd want to add this to the query
        if (searchTerm && result.data.length > 0) {
          result.data = result.data.filter(item => 
            item.name.toLowerCase().includes(searchTerm.toLowerCase())
          );
          result.meta.total = result.data.length;
        }`
            : `const result = await this.${this.moduleName}Repository.find();`
        }

        // Cache the result
        await this.cacheService.set(cacheKey, result, this.CACHE_TTL);

        return result;
      }

      async findById(id: number): Promise<${this.moduleNameCapitalized}> {
        // Try to get from cache first
        const cacheKey = this.cacheService.generateKey(this.CACHE_PREFIX, id);
        const cached${this.moduleNameCapitalized} = await this.cacheService.get<${
          this.moduleNameCapitalized
        }>(cacheKey);
        if (cached${this.moduleNameCapitalized}) {
          return cached${this.moduleNameCapitalized};
        }

        const ${this.moduleName} = await this.${this.moduleName}Repository.findById(id);
        if (!${this.moduleName}) {
          throw new NotFoundException(\`${
            this.moduleNameCapitalized
          } with ID \${id} not found\`);
        }

        // Cache the result
        await this.cacheService.set(cacheKey, ${this.moduleName}, this.CACHE_TTL);

        return ${this.moduleName};
      }

      async update(id: number, update${this.moduleNameCapitalized}Dto: Update${
        this.moduleNameCapitalized
      }Dto): Promise<${this.moduleNameCapitalized}> {
        const ${this.moduleName} = await this.findById(id);
        if (!${this.moduleName}) {
          throw new NotFoundException(\`${
            this.moduleNameCapitalized
          } with ID \${id} not found\`);
        }

        await this.${this.moduleName}Repository.update(id, update${
          this.moduleNameCapitalized
        }Dto);
        const updated${this.moduleNameCapitalized} = await this.findById(id);

        // Update cache
        const cacheKey = this.cacheService.generateKey(this.CACHE_PREFIX, id);
        await this.cacheService.set(cacheKey, updated${
          this.moduleNameCapitalized
        }, this.CACHE_TTL);

        // Invalidate the list cache
        await this.cacheService.del(this.cacheService.generateListKey(this.CACHE_PREFIX));

        return updated${this.moduleNameCapitalized};
      }

      async remove(id: number): Promise<void> {
        const result = await this.${this.moduleName}Repository.delete(id);
        if (!result) {
          throw new NotFoundException(\`${
            this.moduleNameCapitalized
          } with ID \${id} not found\`);
        }

        // Remove from cache
        await this.cacheService.del(this.cacheService.generateKey(this.CACHE_PREFIX, id));
        // Invalidate the list cache
        await this.cacheService.del(this.cacheService.generateListKey(this.CACHE_PREFIX));
      }
    }
`;

    await this.writeFile('', `${this.moduleName}.service.ts`, content);
  }

  private async generateController(): Promise<void> {
    const authImport = this.includeAuth
      ? `\nimport { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';`
      : '';
    const authDecorator = this.includeAuth ? '\n@UseGuards(JwtAuthGuard)' : '';

    const paginationImports = this.includePagination
      ? `\nimport { ${this.moduleNameCapitalized}QueryOptions } from './interfaces/${this.moduleName}-options.interface';`
      : '';

    const findAllMethod = this.includePagination
      ? `
  @Get()
  findAll(
    @Query('page', new ValidationPipe({ transform: true })) page?: number,
    @Query('limit', new ValidationPipe({ transform: true })) limit?: number,
    @Query('orderBy') orderBy?: string,
    @Query('orderDir') orderDir?: 'ASC' | 'DESC',
    @Query('includeInactive') includeInactive?: boolean,
    @Query('name') name?: string,
    @Query('isActive') isActive?: boolean,
    @Query('searchTerm') searchTerm?: string,
    @Query('createdAfter') createdAfter?: Date,
    @Query('createdBefore') createdBefore?: Date,
    @Query('includes') includes?: string[],
  ) {
    const queryOptions: ${this.moduleNameCapitalized}QueryOptions = {
      page,
      limit,
      orderBy,
      orderDir,
      includeInactive,
      name,
      isActive,
      searchTerm,
      createdAfter,
      createdBefore,
      includes,
    };

    return this.${this.moduleName}Service.findAll(queryOptions);
  }`
      : `
  @Get()
  findAll() {
    return this.${this.moduleName}Service.findAll();
  }`;

    const content = `import {
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
  Query,
  ValidationPipe,
  ${this.includeAuth ? 'UseGuards,' : ''}
} from '@nestjs/common';
import { ${this.moduleNameCapitalized}Service } from './${this.moduleName}.service';
import { Create${this.moduleNameCapitalized}Dto } from './dto/create-${this.moduleName}.dto';
import { Update${this.moduleNameCapitalized}Dto } from './dto/update-${this.moduleName}.dto';
import { Query${this.moduleNameCapitalized}Dto } from './dto/query-${this.moduleName}.dto';${authImport}${paginationImports}

@Controller('${this.moduleName}s')${authDecorator}
export class ${this.moduleNameCapitalized}Controller {
  constructor(private readonly ${this.moduleName}Service: ${this.moduleNameCapitalized}Service) {}

  @Post()
  create(@Body() create${this.moduleNameCapitalized}Dto: Create${this.moduleNameCapitalized}Dto) {
    return this.${this.moduleName}Service.create(create${this.moduleNameCapitalized}Dto);
  }
${findAllMethod}

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.${this.moduleName}Service.findById(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() update${this.moduleNameCapitalized}Dto: Update${this.moduleNameCapitalized}Dto,
  ) {
    return this.${this.moduleName}Service.update(id, update${this.moduleNameCapitalized}Dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.${this.moduleName}Service.remove(id);
  }
}
`;

    await this.writeFile('', `${this.moduleName}.controller.ts`, content);
  }

  private async generateModule(): Promise<void> {
    const content = `import { Module } from '@nestjs/common';
    import { ${this.moduleNameCapitalized}Service } from './${this.moduleName}.service';
    import { ${this.moduleNameCapitalized}Controller } from './${this.moduleName}.controller';
    import { ${this.moduleNameCapitalized}Repository } from './repositories/${this.moduleName}.repository';
    import { RedisCacheModule } from '../cache/redis-cache.module';
    import { RedisCacheService } from '../cache/redis-cache.service';

    @Module({
      imports: [
        RedisCacheModule,
      ],
      controllers: [${this.moduleNameCapitalized}Controller],
      providers: [${this.moduleNameCapitalized}Service, ${this.moduleNameCapitalized}Repository, RedisCacheService],
      exports: [${this.moduleNameCapitalized}Service],
    })
    export class ${this.moduleNameCapitalized}Module {}
`;

    await this.writeFile('', `${this.moduleName}.module.ts`, content);
  }

  private async writeFile(
    subDir: string,
    fileName: string,
    content: string,
  ): Promise<void> {
    const filePath = path.join(this.modulePath, subDir, fileName);
    await fs.promises.writeFile(filePath, content);
    console.log(`Created ${filePath}`);
  }

  private async registerModuleInAppModule(): Promise<void> {
    try {
      // Read the app.module.ts file
      const appModuleContent = await fs.promises.readFile(
        this.appModulePath,
        'utf8',
      );

      // Check if the module is already registered
      if (appModuleContent.includes(`${this.moduleNameCapitalized}Module`)) {
        console.log(
          `Module ${this.moduleNameCapitalized}Module is already registered in app.module.ts`,
        );
        return;
      }

      // Prepare import statement
      const importStatement = `import { ${this.moduleNameCapitalized}Module } from './modules/${this.moduleName}/${this.moduleName}.module';`;

      // Add import statement after the last import
      let modifiedContent = appModuleContent;
      const lastImportIndex = appModuleContent.lastIndexOf('import ');
      const lastImportLineEndIndex = appModuleContent.indexOf(
        '\n',
        lastImportIndex,
      );

      if (lastImportIndex !== -1 && lastImportLineEndIndex !== -1) {
        modifiedContent =
          appModuleContent.substring(0, lastImportLineEndIndex + 1) +
          importStatement +
          '\n' +
          appModuleContent.substring(lastImportLineEndIndex + 1);
      }

      // Add module to imports array
      const importsArrayStartIndex = modifiedContent.indexOf('imports: [');
      if (importsArrayStartIndex !== -1) {
        // Find the position after the opening bracket and the last import before the closing bracket
        const afterOpeningBracket =
          modifiedContent.indexOf('[', importsArrayStartIndex) + 1;
        const lastItem = modifiedContent.lastIndexOf(
          ',',
          modifiedContent.indexOf(']', afterOpeningBracket),
        );

        if (lastItem !== -1 && lastItem > afterOpeningBracket) {
          // Insert after the last item
          modifiedContent =
            modifiedContent.substring(0, lastItem + 1) +
            '\n    ' +
            this.moduleNameCapitalized +
            'Module,' +
            modifiedContent.substring(lastItem + 1);
        }
      }

      // Write the updated content back to the file
      await fs.promises.writeFile(this.appModulePath, modifiedContent, 'utf8');
      console.log(
        `✅ Module ${this.moduleNameCapitalized}Module registered in app.module.ts`,
      );
    } catch (error) {
      console.error(`❌ Failed to register module in app.module.ts:`, error);
    }
  }
}

// Create utils.ts file
const utilsContent = `export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
`;

if (!fs.existsSync('scripts/utils.ts')) {
  fs.writeFileSync('scripts/utils.ts', utilsContent);
}

// This code will only run if the file is executed directly, not when imported
if (require.main === module) {
  const generator = new ModuleGenerator({
    name: process.argv[2] || 'example',
    includePagination: process.argv.includes('--pagination'),
    includeAuth: process.argv.includes('--auth'),
  });

  generator.generate().catch(console.error);
}
