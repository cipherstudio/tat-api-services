import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { OracleService } from '../../../database/oracle.service';
import { PaginatedResult } from '../../../common/interfaces/pagination.interface';

@Injectable()
export class UserRepository extends Repository<User> {
  private readonly SEQ_NAME = 'USER_ID_SEQ';

  constructor(
    private dataSource: DataSource,
    private oracleService: OracleService,
  ) {
    super(User, dataSource.createEntityManager());

    // Initialize sequence
    this.initSequence();
  }

  private async initSequence(): Promise<void> {
    await this.oracleService.createSequenceIfNotExists(this.SEQ_NAME);
  }

  /**
   * Override the save method to handle Oracle-specific behavior
   */
  async save<T extends User>(entity: T): Promise<T>;
  async save<T extends User>(entities: T[]): Promise<T[]>;
  async save<T extends User>(entityOrEntities: T | T[]): Promise<T | T[]> {
    // Handle single entity
    if (!Array.isArray(entityOrEntities)) {
      const entity = entityOrEntities;

      // If it's a new entity, get ID from the sequence
      if (!entity.id) {
        entity.id = await this.oracleService.getNextSequenceValue(
          this.SEQ_NAME,
        );
      }

      // Handle JSON/CLOB fields if needed
      // For example, if we had a metadata field, we would do:
      // if (entity.metadata) {
      //   entity.metadata = OracleHelper.toJsonClob(entity.metadata);
      // }

      return super.save(entity);
    }

    // Handle array of entities
    const entities = entityOrEntities;
    for (const entity of entities) {
      if (!entity.id) {
        entity.id = await this.oracleService.getNextSequenceValue(
          this.SEQ_NAME,
        );
      }

      // Handle JSON/CLOB fields for each entity if needed
    }

    return super.save(entities);
  }

  /**
   * Find users with Oracle-optimized pagination
   */
  async findWithPagination(
    page: number = 1,
    limit: number = 10,
    orderBy: string = 'createdAt',
    orderDir: 'ASC' | 'DESC' = 'DESC',
    filters: Partial<User> = {},
  ): Promise<PaginatedResult<User>> {
    const queryParams: any[] = [];
    let whereClause = '1=1';
    let paramIndex = 0;

    // Build WHERE clause based on filters
    if (filters.email) {
      whereClause += ` AND UPPER(email) LIKE UPPER(:${paramIndex})`;
      queryParams.push(`%${filters.email}%`);
      paramIndex++;
    }

    if (filters.role) {
      whereClause += ` AND role = :${paramIndex}`;
      queryParams.push(filters.role);
      paramIndex++;
    }

    if (filters.isActive !== undefined) {
      whereClause += ` AND is_active = :${paramIndex}`;
      queryParams.push(filters.isActive ? 1 : 0);
      paramIndex++;
    }

    // Build the query
    const baseQuery = `
      SELECT id, email, full_name, role, is_active, created_at, updated_at
      FROM users
      WHERE ${whereClause}
      ORDER BY ${orderBy} ${orderDir}
    `;

    // Execute the query with Oracle pagination
    const [result, total] =
      await this.oracleService.executePaginatedQuery<User>(
        baseQuery,
        page,
        limit,
        queryParams,
      );

    return {
      data: result,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
        limit,
      },
    };
  }
}
