import { Injectable } from '@nestjs/common';
import { KnexBaseRepository } from '../../../common/repositories/knex-base.repository';
import { AccommodationRates } from '../entities/accommodation-rates.entity';
import { KnexService } from '../../../database/knex-service/knex.service';
import { toCamelCase, toSnakeCase } from '../../../common/utils/case-mapping';

@Injectable()
export class AccommodationRatesRepository extends KnexBaseRepository<AccommodationRates> {
  constructor(knexService: KnexService) {
    super(knexService, 'accommodation_rates');
  }

  async create(entity: Partial<AccommodationRates>): Promise<AccommodationRates> {
    const dbEntity = await toSnakeCase(entity);
    const created = await super.create(dbEntity);
    return await toCamelCase<AccommodationRates>(created);
  }

  async update(id: number, entity: Partial<AccommodationRates>): Promise<AccommodationRates> {
    const dbEntity = await toSnakeCase(entity);
    const updated = await super.update(id, dbEntity);
    return await toCamelCase<AccommodationRates>(updated);
  }

  async findById(id: number): Promise<AccommodationRates | undefined> {
    const dbEntity = await super.findById(id);
    return dbEntity ? await toCamelCase<AccommodationRates>(dbEntity) : undefined;
  }

  async findOne(conditions: Record<string, any>): Promise<AccommodationRates | undefined> {
    const dbEntity = await super.findOne(conditions);
    return dbEntity ? await toCamelCase<AccommodationRates>(dbEntity) : undefined;
  }

  async find(conditions: Record<string, any> = {}): Promise<AccommodationRates[]> {
    const dbEntities = await super.find(conditions);
    return Promise.all(dbEntities.map(async (e) => await toCamelCase<AccommodationRates>(e)));
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
      data: await Promise.all(result.data.map(async (e) => await toCamelCase<AccommodationRates>(e))),
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
    const query = this.knex(this.tableName);

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
      query.where((builder) => {
        builder
          .whereRaw('LOWER("position_name") LIKE ?', [`%${searchTerm.toLowerCase()}%`])
          .orWhereRaw('LOWER("level_code_start") LIKE ?', [`%${searchTerm.toLowerCase()}%`])
          .orWhereRaw('LOWER("level_code_end") LIKE ?', [`%${searchTerm.toLowerCase()}%`]);
      });
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
      data: await Promise.all(data.map(async (e) => await toCamelCase<AccommodationRates>(e))),
      meta: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async findByTravelType(travelType: string): Promise<AccommodationRates[]> {
    return this.find({ travel_type: travelType });
  }

  async findByPositionName(positionName: string): Promise<AccommodationRates[]> {
    return this.find({ position_name: positionName });
  }

  async findByLevelCode(levelCode: string): Promise<AccommodationRates[]> {
    return this.find({
      level_code_start: { $lte: levelCode },
      level_code_end: { $gte: levelCode }
    });
  }



  async findByRateMode(rateMode: string): Promise<AccommodationRates[]> {
    return this.find({ rate_mode: rateMode });
  }
} 