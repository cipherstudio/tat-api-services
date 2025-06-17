import { Injectable } from '@nestjs/common';
import { OfficeDomestic } from '../entities/office-domestic.entity.js';
import { KnexBaseRepository } from '../../../common/repositories/knex-base.repository.js';
import { KnexService } from '../../../database/knex-service/knex.service.js';
import { toCamelCase, toSnakeCase } from '../../../common/utils/case-mapping.js';
import { Provinces } from '../entities/provinces.entity.js';

@Injectable()
export class OfficeDomesticRepository extends KnexBaseRepository<OfficeDomestic> {
  constructor(knexService: KnexService) {
    super(knexService, 'office_domestic');
  }

  private async mapResult(result: any): Promise<OfficeDomestic> {
    // แยกข้อมูล office_domestic
    const officeData = {
      id: result.id,
      name: result.name,
      region: result.region,
      is_head_office: result.is_head_office,
      province_id: result.province_id,
      created_at: result.created_at,
      updated_at: result.updated_at,
    };

    // แยกข้อมูล province
    const provinceData = result.province_id_mapped ? {
      id: result.province_id_mapped,
      name_th: result.province_name_th,
      name_en: result.province_name_en,
      is_perimeter: result.province_is_perimeter,
      created_at: result.province_created_at,
      updated_at: result.province_updated_at,
    } : null;

    // แปลงเป็น camelCase
    const mappedOffice = await toCamelCase<Partial<OfficeDomestic>>(officeData);
    const mappedProvince = provinceData ? await toCamelCase<Provinces>(provinceData) : undefined;

    return {
      ...mappedOffice,
      province: mappedProvince,
    } as OfficeDomestic;
  }

  async create(entity: Partial<OfficeDomestic>): Promise<OfficeDomestic> {
    const dbEntity = await toSnakeCase(entity);
    const created = await super.create(dbEntity);
    return await toCamelCase<OfficeDomestic>(created);
  }

  async update(id: number, entity: Partial<OfficeDomestic>): Promise<OfficeDomestic> {
    const dbEntity = await toSnakeCase(entity);
    const updated = await super.update(id, dbEntity);
    return await toCamelCase<OfficeDomestic>(updated);
  }

  async findById(id: number): Promise<OfficeDomestic | undefined> {
    const dbEntity = await this.knexService
      .knex('office_domestic')
      .select(
        'office_domestic.id',
        'office_domestic.name',
        'office_domestic.region',
        'office_domestic.is_head_office',
        'office_domestic.province_id',
        'office_domestic.created_at',
        'office_domestic.updated_at',
        'provinces.id as province_id_mapped',
        'provinces.name_th as province_name_th',
        'provinces.name_en as province_name_en',
        'provinces.is_perimeter as province_is_perimeter',
        'provinces.created_at as province_created_at',
        'provinces.updated_at as province_updated_at'
      )
      .leftJoin('provinces', 'office_domestic.province_id', 'provinces.id')
      .where('office_domestic.id', id)
      .first();

    return dbEntity ? this.mapResult(dbEntity) : undefined;
  }

  async findOne(conditions: Record<string, any>): Promise<OfficeDomestic | undefined> {
    const dbEntity = await this.knexService
      .knex('office_domestic')
      .select(
        'office_domestic.id',
        'office_domestic.name',
        'office_domestic.region',
        'office_domestic.is_head_office',
        'office_domestic.province_id',
        'office_domestic.created_at',
        'office_domestic.updated_at',
        'provinces.id as province_id_mapped',
        'provinces.name_th as province_name_th',
        'provinces.name_en as province_name_en',
        'provinces.is_perimeter as province_is_perimeter',
        'provinces.created_at as province_created_at',
        'provinces.updated_at as province_updated_at'
      )
      .leftJoin('provinces', 'office_domestic.province_id', 'provinces.id')
      .where(conditions)
      .first();

    return dbEntity ? this.mapResult(dbEntity) : undefined;
  }

  async find(conditions: Record<string, any> = {}): Promise<OfficeDomestic[]> {
    const dbEntities = await this.knexService
      .knex('office_domestic')
      .select(
        'office_domestic.id',
        'office_domestic.name',
        'office_domestic.region',
        'office_domestic.is_head_office',
        'office_domestic.province_id',
        'office_domestic.created_at',
        'office_domestic.updated_at',
        'provinces.id as province_id_mapped',
        'provinces.name_th as province_name_th',
        'provinces.name_en as province_name_en',
        'provinces.is_perimeter as province_is_perimeter',
        'provinces.created_at as province_created_at',
        'provinces.updated_at as province_updated_at'
      )
      .leftJoin('provinces', 'office_domestic.province_id', 'provinces.id')
      .where(conditions);

    return Promise.all(dbEntities.map(row => this.mapResult(row)));
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
    const baseQuery = this.knexService.knex('office_domestic')
      .select(
        'office_domestic.id',
        'office_domestic.name',
        'office_domestic.region',
        'office_domestic.is_head_office',
        'office_domestic.province_id',
        'office_domestic.created_at',
        'office_domestic.updated_at',
        'provinces.id as province_id_mapped',
        'provinces.name_th as province_name_th',
        'provinces.name_en as province_name_en',
        'provinces.is_perimeter as province_is_perimeter',
        'provinces.created_at as province_created_at',
        'provinces.updated_at as province_updated_at'
      )
      .leftJoin('provinces', 'office_domestic.province_id', 'provinces.id');

    // Add search condition if searchTerm exists
    if (searchTerm) {
      baseQuery.where(function() {
        this.whereRaw('LOWER("office_domestic"."name") LIKE ?', [`%${searchTerm.toLowerCase()}%`])
          .orWhereRaw('LOWER("office_domestic"."region") LIKE ?', [`%${searchTerm.toLowerCase()}%`]);
      });
    }

    // Add other conditions
    if (Object.keys(otherConditions).length > 0) {
      baseQuery.where(otherConditions);
    }

    // Create separate count query
    const countQuery = this.knexService.knex('office_domestic')
      .count('* as total')
      .where(function() {
        if (searchTerm) {
          this.whereRaw('LOWER("office_domestic"."name") LIKE ?', [`%${searchTerm.toLowerCase()}%`])
            .orWhereRaw('LOWER("office_domestic"."region") LIKE ?', [`%${searchTerm.toLowerCase()}%`]);
        }
        if (Object.keys(otherConditions).length > 0) {
          this.where(otherConditions);
        }
      });

    // Get paginated data
    const dataQuery = baseQuery.clone()
      .orderBy(`office_domestic.${orderBy}`, direction)
      .limit(limit)
      .offset(offset);

    const [countResult, data] = await Promise.all([countQuery, dataQuery]);
    const total = Number(countResult?.[0]?.total || 0);

    return {
      data: await Promise.all(data.map(row => this.mapResult(row))),
      meta: {
        total,
        page,
        limit,
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
    // Create base query builder for data
    const baseQuery = this.knexService.knex('office_domestic')
      .select(
        'office_domestic.id',
        'office_domestic.name',
        'office_domestic.region',
        'office_domestic.is_head_office',
        'office_domestic.province_id',
        'office_domestic.created_at',
        'office_domestic.updated_at',
        'provinces.id as province_id_mapped',
        'provinces.name_th as province_name_th',
        'provinces.name_en as province_name_en',
        'provinces.is_perimeter as province_is_perimeter',
        'provinces.created_at as province_created_at',
        'provinces.updated_at as province_updated_at'
      )
      .leftJoin('provinces', 'office_domestic.province_id', 'provinces.id');

    // Create count query
    const countQuery = this.knexService.knex('office_domestic')
      .count('* as count')
      .leftJoin('provinces', 'office_domestic.province_id', 'provinces.id');

    // Apply base conditions
    if (Object.keys(conditions).length > 0) {
      baseQuery.where(conditions);
      countQuery.where(conditions);
    }

    // Apply search term if provided
    if (searchTerm) {
      const searchCondition = function(builder) {
        builder.whereRaw('LOWER("office_domestic"."name") LIKE ?', [`%${searchTerm.toLowerCase()}%`])
          .orWhereRaw('LOWER("office_domestic"."region") LIKE ?', [`%${searchTerm.toLowerCase()}%`]);
      };
      baseQuery.where(searchCondition);
      countQuery.where(searchCondition);
    }

    const offset = (page - 1) * limit;

    // Get total count with search conditions
    const countResult = await countQuery.first();
    const total = Number(countResult?.count || 0);

    // Get paginated data
    const data = await baseQuery
      .orderBy(`office_domestic.${orderBy}`, direction)
      .limit(limit)
      .offset(offset);

    return {
      data: await Promise.all(data.map(row => this.mapResult(row))),
      meta: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit),
      },
    };
  }
} 