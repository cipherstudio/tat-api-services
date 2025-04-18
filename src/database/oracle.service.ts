import { Injectable, Logger } from '@nestjs/common';
import { KnexService } from './knex-service/knex.service';
import { OracleHelper } from './oracle-helper';

/**
 * Service for Oracle-specific database operations
 */
@Injectable()
export class OracleService {
  private readonly logger = new Logger(OracleService.name);

  constructor(private readonly knexService: KnexService) {}

  /**
   * Execute Oracle PL/SQL block for creating sequences
   * @param sequenceName Name of the sequence to create
   */
  async createSequenceIfNotExists(sequenceName: string): Promise<void> {
    try {
      const sql = OracleHelper.createSequenceSql(sequenceName);
      await this.knexService.knex.raw(sql);
      this.logger.log(`Sequence ${sequenceName} created or already exists`);
    } catch (error) {
      this.logger.error(
        `Failed to create sequence ${sequenceName}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Get next value from a sequence
   * @param sequenceName Name of the sequence
   * @returns Next sequence value
   */
  async getNextSequenceValue(sequenceName: string): Promise<number> {
    try {
      const result = await this.knexService.knex.raw(
        `SELECT ${sequenceName}.NEXTVAL AS id FROM DUAL`,
      );
      return result[0]?.id;
    } catch (error) {
      this.logger.error(
        `Failed to get next sequence value from ${sequenceName}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Execute a paginated query for Oracle
   * @param baseQuery The base SQL query
   * @param page Page number (1-based)
   * @param limit Items per page
   * @param params Query parameters
   * @returns Results and total count
   */
  async executePaginatedQuery<T>(
    baseQuery: string,
    page: number = 1,
    limit: number = 10,
    params: any[] = [],
  ): Promise<[T[], number]> {
    try {
      const paginatedQuery = OracleHelper.buildPaginatedQuery(
        baseQuery,
        page,
        limit,
      );

      // Execute paginated query
      const results = await this.knexService.knex.raw(paginatedQuery, params);

      // Get total count
      const countQuery = `SELECT COUNT(*) as total FROM (${baseQuery})`;
      const countResult = await this.knexService.knex.raw(countQuery, params);

      return [results, countResult[0]?.total || 0];
    } catch (error) {
      this.logger.error(
        `Failed to execute paginated query: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
