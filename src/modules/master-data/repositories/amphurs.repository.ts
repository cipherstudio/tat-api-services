import { Injectable } from '@nestjs/common';
import { Amphurs } from '../entities/amphurs.entity';
import { KnexBaseRepository } from '../../../common/repositories/knex-base.repository';
import { KnexService } from '../../../database/knex-service/knex.service';
import { toCamelCase, toSnakeCase } from '../../../common/utils/case-mapping';

@Injectable()
export class AmphursRepository extends KnexBaseRepository<Amphurs> {
  constructor(knexService: KnexService) {
    super(knexService, 'amphurs');
  }

  async create(entity: Partial<Amphurs>): Promise<Amphurs> {
    const dbEntity = await toSnakeCase(entity);
    const created = await super.create(dbEntity);
    return await toCamelCase<Amphurs>(created);
  }

  async update(id: number, entity: Partial<Amphurs>): Promise<Amphurs> {
    const dbEntity = await toSnakeCase(entity);
    const updated = await super.update(id, dbEntity);
    return await toCamelCase<Amphurs>(updated);
  }

  async findById(id: number): Promise<Amphurs | undefined> {
    const dbEntity = await this.knexService
      .knex('amphurs')
      .select(
        'amphurs.id',
        'amphurs.name_th',
        'amphurs.name_en',
        'amphurs.province_id',
        'amphurs.created_at',
        'amphurs.updated_at',
        'provinces.name_th as province_name_th',
        'provinces.name_en as province_name_en'
      )
      .leftJoin('provinces', 'amphurs.province_id', 'provinces.id')
      .where('amphurs.id', id)
      .first();

    return dbEntity ? await toCamelCase<Amphurs>(dbEntity) : undefined;
  }

  async findOne(conditions: Record<string, any>): Promise<Amphurs | undefined> {
    const dbEntity = await this.knexService
      .knex('amphurs')
      .select(
        'amphurs.id',
        'amphurs.name_th',
        'amphurs.name_en',
        'amphurs.province_id',
        'amphurs.created_at',
        'amphurs.updated_at',
        'provinces.name_th as province_name_th',
        'provinces.name_en as province_name_en'
      )
      .leftJoin('provinces', 'amphurs.province_id', 'provinces.id')
      .where(conditions)
      .first();

    return dbEntity ? await toCamelCase<Amphurs>(dbEntity) : undefined;
  }

  async find(conditions: Record<string, any> = {}): Promise<Amphurs[]> {
    const dbEntities = await this.knexService
      .knex('amphurs')
      .select(
        'amphurs.id',
        'amphurs.name_th',
        'amphurs.name_en',
        'amphurs.province_id',
        'amphurs.created_at',
        'amphurs.updated_at',
        'provinces.name_th as province_name_th',
        'provinces.name_en as province_name_en'
      )
      .leftJoin('provinces', 'amphurs.province_id', 'provinces.id')
      .where(conditions);

    return Promise.all(dbEntities.map(async (e) => await toCamelCase<Amphurs>(e)));
  }

  async findWithPagination(
    page: number = 1,
    limit: number = 10,
    conditions: Record<string, any> = {},
    orderBy: string = 'id',
    direction: 'asc' | 'desc' = 'asc',
  ) {
    const offset = (page - 1) * limit;

    // Extract searchTerm from conditions if it exists
    const { searchTerm, ...otherConditions } = conditions;

    // Create base query builder for data
    const baseQuery = this.knexService.knex('amphurs')
      .select(
        'amphurs.id',
        'amphurs.name_th',
        'amphurs.name_en',
        'amphurs.province_id',
        'amphurs.created_at',
        'amphurs.updated_at',
        'provinces.name_th as province_name_th',
        'provinces.name_en as province_name_en'
      )
      .leftJoin('provinces', 'amphurs.province_id', 'provinces.id');

    // Add search condition if searchTerm exists
    if (searchTerm) {
      baseQuery.where(function() {
        this.whereRaw('LOWER("amphurs"."name_th") LIKE ?', [`%${searchTerm.toLowerCase()}%`])
          .orWhereRaw('LOWER("amphurs"."name_en") LIKE ?', [`%${searchTerm.toLowerCase()}%`]);
      });
    }

    // Add other conditions
    if (Object.keys(otherConditions).length > 0) {
      baseQuery.where(otherConditions);
    }

    // Create separate count query
    const countQuery = this.knexService.knex('amphurs')
      .count('* as total')
      .where(function() {
        if (searchTerm) {
          this.whereRaw('LOWER("amphurs"."name_th") LIKE ?', [`%${searchTerm.toLowerCase()}%`])
            .orWhereRaw('LOWER("amphurs"."name_en") LIKE ?', [`%${searchTerm.toLowerCase()}%`]);
        }
        if (Object.keys(otherConditions).length > 0) {
          this.where(otherConditions);
        }
      });

    // Get paginated data
    const dataQuery = baseQuery.clone()
      .orderBy(orderBy, direction)
      .limit(limit)
      .offset(offset);

    const [countResult, data] = await Promise.all([countQuery, dataQuery]);
    const total = Number(countResult?.[0]?.total || 0);

    return {
      data: await Promise.all(data.map(async (e) => await toCamelCase<Amphurs>(e))),
      meta: {
        total,
        page,
        limit,
      },
    };
  }
} 