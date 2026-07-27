import { Injectable } from '@nestjs/common';
import { KnexBaseRepository } from '../../../common/repositories/knex-base.repository';
import { TrainingAccommodationRates } from '../entities/training-accommodation-rates.entity';
import { KnexService } from '../../../database/knex-service/knex.service';
import { toCamelCase, toSnakeCase } from '../../../common/utils/case-mapping';

@Injectable()
export class TrainingAccommodationRatesRepository extends KnexBaseRepository<TrainingAccommodationRates> {
  constructor(knexService: KnexService) {
    super(knexService, 'training_accommodation_rates');
  }

  async create(entity: Partial<TrainingAccommodationRates>): Promise<TrainingAccommodationRates> {
    const dbEntity = await toSnakeCase(entity);
    const created = await super.create(dbEntity);
    return await toCamelCase<TrainingAccommodationRates>(created);
  }

  async update(id: number, entity: Partial<TrainingAccommodationRates>): Promise<TrainingAccommodationRates> {
    const dbEntity = await toSnakeCase(entity);
    const updated = await super.update(id, dbEntity);
    return await toCamelCase<TrainingAccommodationRates>(updated);
  }

  async findById(id: number): Promise<TrainingAccommodationRates | undefined> {
    const dbEntity = await super.findById(id);
    return dbEntity ? await toCamelCase<TrainingAccommodationRates>(dbEntity) : undefined;
  }

  async findOne(conditions: Record<string, any>): Promise<TrainingAccommodationRates | undefined> {
    const dbEntity = await super.findOne(conditions);
    return dbEntity ? await toCamelCase<TrainingAccommodationRates>(dbEntity) : undefined;
  }

  async find(conditions: Record<string, any> = {}): Promise<TrainingAccommodationRates[]> {
    const dbEntities = await super.find(conditions);
    return Promise.all(dbEntities.map(async (e) => await toCamelCase<TrainingAccommodationRates>(e)));
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
      data: await Promise.all(result.data.map(async (e) => await toCamelCase<TrainingAccommodationRates>(e))),
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
          .whereRaw('LOWER("travel_type") LIKE ?', [`%${searchTerm.toLowerCase()}%`])
          .orWhereRaw('LOWER("training_type") LIKE ?', [`%${searchTerm.toLowerCase()}%`])
          .orWhereRaw('LOWER("position_name") LIKE ?', [`%${searchTerm.toLowerCase()}%`])
          .orWhereRaw('LOWER("position_group_name") LIKE ?', [`%${searchTerm.toLowerCase()}%`]);
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
      data: await Promise.all(data.map(async (e) => await toCamelCase<TrainingAccommodationRates>(e))),
      meta: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async findByTravelType(travelType: string): Promise<TrainingAccommodationRates[]> {
    return this.find({ travel_type: travelType });
  }

  async findByTrainingType(trainingType: string): Promise<TrainingAccommodationRates[]> {
    return this.find({ training_type: trainingType });
  }
}
