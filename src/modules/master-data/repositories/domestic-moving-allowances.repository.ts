import { Injectable } from '@nestjs/common';
import { KnexBaseRepository } from '../../../common/repositories/knex-base.repository';
import { DomesticMovingAllowances } from '../entities/domestic-moving-allowances.entity';
import { KnexService } from '../../../database/knex-service/knex.service';
import { toCamelCase, toSnakeCase } from '../../../common/utils/case-mapping';

@Injectable()
export class DomesticMovingAllowancesRepository extends KnexBaseRepository<DomesticMovingAllowances> {
  constructor(knexService: KnexService) {
    super(knexService, 'domestic_moving_allowances');
  }

  async create(
    entity: Partial<DomesticMovingAllowances>,
  ): Promise<DomesticMovingAllowances> {
    const dbEntity = await toSnakeCase(entity);
    const created = await super.create(dbEntity);
    return await toCamelCase<DomesticMovingAllowances>(created);
  }

  async update(
    id: number,
    entity: Partial<DomesticMovingAllowances>,
  ): Promise<DomesticMovingAllowances> {
    const dbEntity = await toSnakeCase(entity);
    const updated = await super.update(id, dbEntity);
    return await toCamelCase<DomesticMovingAllowances>(updated);
  }

  async findById(id: number): Promise<DomesticMovingAllowances | undefined> {
    const dbEntity = await super.findById(id);
    return dbEntity
      ? await toCamelCase<DomesticMovingAllowances>(dbEntity)
      : undefined;
  }

  async findOne(
    conditions: Record<string, any>,
  ): Promise<DomesticMovingAllowances | undefined> {
    const dbEntity = await super.findOne(conditions);
    return dbEntity
      ? await toCamelCase<DomesticMovingAllowances>(dbEntity)
      : undefined;
  }

  async find(
    conditions: Record<string, any> = {},
  ): Promise<DomesticMovingAllowances[]> {
    const dbEntities = await super.find(conditions);
    return Promise.all(
      dbEntities.map(
        async (e) => await toCamelCase<DomesticMovingAllowances>(e),
      ),
    );
  }

  async findWithPagination(
    page: number = 1,
    limit: number = 10,
    conditions: Record<string, any> = {},
    orderBy: string = 'id',
    direction: 'asc' | 'desc' = 'asc',
  ) {
    const query = this.knexService.knex(this.tableName);

    // Apply base conditions
    if (Object.keys(conditions).length > 0) {
      query.where(conditions);
    }

    const offset = (page - 1) * limit;

    // Get total count with conditions
    const countResult = await query.clone().count('* as count').first();
    const total = Number(countResult?.count || 0);

    // Get paginated data
    const data = await query
      .orderBy(orderBy, direction)
      .limit(limit)
      .offset(offset);

    return {
      data: await Promise.all(
        data.map(async (e) => await toCamelCase<DomesticMovingAllowances>(e)),
      ),
      meta: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async findWithPaginationAndSearch(
    page: number = 1,
    limit: number = 10,
    conditions: Record<string, any> = {},
    orderBy: string = 'id',
    direction: 'asc' | 'desc' = 'asc',
    searchTerm?: string,
  ) {
    const query = this.knexService.knex(this.tableName);

    // Apply base conditions
    if (Object.keys(conditions).length > 0) {
      const dbConditions = await toSnakeCase(conditions);
      Object.entries(dbConditions).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query.where(key, value);
        }
      });
    }

    // Apply search term if provided
    if (searchTerm) {
      // ตรวจสอบว่า searchTerm เป็นตัวเลขหรือไม่
      const searchDistance = parseFloat(searchTerm);

      if (!isNaN(searchDistance)) {
        // ถ้าเป็นตัวเลข ให้ค้นหาระยะทางที่อยู่ในช่วง
        query.where((builder) => {
          builder
            .where('distance_start_km', '<=', searchDistance)
            .where('distance_end_km', '>=', searchDistance);
        });
      } else {
        // ถ้าไม่ใช่ตัวเลข ให้ค้นหาแบบ text ใน distance และ rate fields
        query.where((builder) => {
          builder
            .whereRaw('LOWER(CAST("distance_start_km" AS TEXT)) LIKE ?', [
              `%${searchTerm.toLowerCase()}%`,
            ])
            .orWhereRaw('LOWER(CAST("distance_end_km" AS TEXT)) LIKE ?', [
              `%${searchTerm.toLowerCase()}%`,
            ])
            .orWhereRaw('LOWER(CAST("rate_baht" AS TEXT)) LIKE ?', [
              `%${searchTerm.toLowerCase()}%`,
            ]);
        });
      }
    }

    const offset = (page - 1) * limit;

    // Get total count with search conditions
    const countResult = await query.clone().count('* as count').first();
    const total = Number(countResult?.count || 0);

    // Convert orderBy to snake_case for database
    const dbOrderBy = await toSnakeCase({ [orderBy]: null });
    const dbOrderByKey = Object.keys(dbOrderBy)[0];

    // Get paginated data
    const data = await query
      .orderBy(dbOrderByKey, direction)
      .limit(limit)
      .offset(offset);

    return {
      data: await Promise.all(
        data.map(async (e) => await toCamelCase<DomesticMovingAllowances>(e)),
      ),
      meta: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async findByDistanceRange(
    distance: number,
  ): Promise<DomesticMovingAllowances | undefined> {
    const dbEntity = await this.knexService
      .knex(this.tableName)
      .where('distance_start_km', '<=', distance)
      .where('distance_end_km', '>=', distance)
      .first();

    return dbEntity
      ? await toCamelCase<DomesticMovingAllowances>(dbEntity)
      : undefined;
  }

  async findByRateRange(
    minRate: number,
    maxRate: number,
  ): Promise<DomesticMovingAllowances[]> {
    const dbEntities = await this.knexService
      .knex(this.tableName)
      .where('rate_baht', '>=', minRate)
      .where('rate_baht', '<=', maxRate);

    return Promise.all(
      dbEntities.map(
        async (e) => await toCamelCase<DomesticMovingAllowances>(e),
      ),
    );
  }
}
