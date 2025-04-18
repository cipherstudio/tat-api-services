import {
  Repository,
  FindOptionsWhere,
  FindOptionsOrder,
  FindOptionsSelect,
  FindOptionsRelations,
  DataSource,
} from 'typeorm';
import { OracleService } from '../../database/oracle.service';
import { OracleHelper } from '../../database/oracle-helper';
import { Inject, Optional } from '@nestjs/common';

export interface PaginateOptions {
  page?: number;
  limit?: number;
  searchField?: string;
  searchValue?: string;
  orderBy?: { [key: string]: 'ASC' | 'DESC' };
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
    limit: number;
  };
}

export interface FindAllOptions<T> {
  where?: FindOptionsWhere<T>;
  order?: FindOptionsOrder<T>;
  select?: FindOptionsSelect<T>;
  relations?: FindOptionsRelations<T>;
  withDeleted?: boolean;
}

export class BaseRepository<T> extends Repository<T> {
  @Optional()
  @Inject()
  protected oracleService: OracleService;

  private readonly isOracleDbEnabled: boolean;

  constructor(entity: any, dataSource: DataSource) {
    super(entity, dataSource.createEntityManager());
    // Check if we're using Oracle by checking the DB type
    this.isOracleDbEnabled = dataSource.options.type === 'oracle';
  }

  async paginate(
    options: PaginateOptions = {},
    findOptions: FindAllOptions<T> = {},
  ): Promise<PaginatedResult<T>> {
    const page = options.page || 1;
    const limit = options.limit || 10;

    // If OracleService is available and Oracle is the DB type, use Oracle-optimized pagination
    if (this.oracleService && this.isOracleDbEnabled) {
      return this.paginateWithOracle(page, limit, options, findOptions);
    }

    // Otherwise, use standard TypeORM pagination
    return this.paginateWithTypeorm(page, limit, options, findOptions);
  }

  /**
   * Use Oracle-optimized pagination through direct SQL
   */
  private async paginateWithOracle(
    page: number,
    limit: number,
    options: PaginateOptions,
    findOptions: FindAllOptions<T>,
  ): Promise<PaginatedResult<T>> {
    try {
      // Build where conditions based on findOptions and options
      let whereClause = '1=1';
      const queryParams: any[] = [];
      let paramIndex = 0;

      // Handle search field
      if (options.searchField && options.searchValue) {
        whereClause += ` AND UPPER(${this.snakeCaseColumn(options.searchField)}) LIKE UPPER(:${paramIndex})`;
        queryParams.push(`%${options.searchValue}%`);
        paramIndex++;
      }

      // Handle where conditions
      if (findOptions.where) {
        Object.entries(findOptions.where).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            // Handle boolean values
            if (typeof value === 'boolean') {
              whereClause += ` AND ${this.snakeCaseColumn(key)} = :${paramIndex}`;
              queryParams.push(OracleHelper.booleanToNumber(value));
            } else {
              whereClause += ` AND ${this.snakeCaseColumn(key)} = :${paramIndex}`;
              queryParams.push(value);
            }
            paramIndex++;
          }
        });
      }

      // Build order clause
      let orderClause = '';
      if (options.orderBy) {
        const orderParts = Object.entries(options.orderBy).map(
          ([key, dir]) => `${this.snakeCaseColumn(key)} ${dir}`,
        );
        orderClause = orderParts.join(', ');
      } else if (findOptions.order) {
        const orderParts = Object.entries(findOptions.order).map(
          ([key, dir]) => `${this.snakeCaseColumn(key)} ${dir}`,
        );
        orderClause = orderParts.join(', ');
      } else {
        orderClause = 'id DESC';
      }

      // Build the query
      const tableName = this.metadata.tableName;
      const baseQuery = `
        SELECT * 
        FROM ${tableName}
        WHERE ${whereClause}
        ORDER BY ${orderClause}
      `;

      // Execute the query with Oracle pagination
      const [result, total] = await this.oracleService.executePaginatedQuery<T>(
        baseQuery,
        page,
        limit,
        queryParams,
      );

      // Map the results (handle CLOB fields, case conversion, etc.)
      const mappedResults = result.map((item: any) => {
        return OracleHelper.mapToEntity<T>(item, this.target as any);
      });

      return {
        data: mappedResults,
        meta: {
          total,
          page,
          lastPage: Math.ceil(total / limit),
          limit,
        },
      };
    } catch (error) {
      // Fallback to TypeORM pagination if Oracle-specific pagination fails
      console.error(
        'Oracle pagination failed, falling back to TypeORM:',
        error,
      );
      return this.paginateWithTypeorm(page, limit, options, findOptions);
    }
  }

  /**
   * Use standard TypeORM pagination
   */
  private async paginateWithTypeorm(
    page: number,
    limit: number,
    options: PaginateOptions,
    findOptions: FindAllOptions<T>,
  ): Promise<PaginatedResult<T>> {
    const skip = (page - 1) * limit;

    // Build where clause
    let where = findOptions.where || {};
    if (options.searchField && options.searchValue) {
      where = {
        ...where,
        [options.searchField]: options.searchValue,
      };
    }

    // Build order clause
    const order = options.orderBy || findOptions.order || { id: 'DESC' };

    const [data, total] = await this.findAndCount({
      ...findOptions,
      where,
      order: order as FindOptionsOrder<T>,
      skip,
      take: limit,
    });

    const lastPage = Math.ceil(total / limit);

    return {
      data,
      meta: {
        total,
        page,
        lastPage,
        limit,
      },
    };
  }

  /**
   * Convert camelCase property name to snake_case column name for SQL queries
   */
  private snakeCaseColumn(camelCase: string): string {
    return camelCase.replace(/([A-Z])/g, '_$1').toLowerCase();
  }

  async findOneByOrFail(where: FindOptionsWhere<T>): Promise<T> {
    const result = await this.findOneBy(where);
    if (!result) {
      throw new Error('Entity not found');
    }
    return result;
  }

  async findWithOptions(options: FindAllOptions<T> = {}): Promise<T[]> {
    return this.find({
      where: options.where,
      order: options.order,
      select: options.select,
      relations: options.relations,
      withDeleted: options.withDeleted,
    });
  }
}
