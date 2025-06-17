import { Injectable } from '@nestjs/common';
import { OfficeInternational } from '../entities/office-international.entity.js';
import { KnexBaseRepository } from '../../../common/repositories/knex-base.repository.js';
import { KnexService } from '../../../database/knex-service/knex.service.js';
import { toCamelCase, toSnakeCase } from '../../../common/utils/case-mapping.js';
import { Countries } from '../entities/countries.entity.js';
import { Currency } from '../entities/currency.entity.js';

@Injectable()
export class OfficeInternationalRepository extends KnexBaseRepository<OfficeInternational> {
  constructor(knexService: KnexService) {
    super(knexService, 'office_international');
  }

  private async mapResult(result: any): Promise<OfficeInternational> {
    // แยกข้อมูล office_international
    const officeData = {
      id: result.id,
      name: result.name,
      region: result.region,
      country_id: result.country_id,
      currency_id: result.currency_id,
      created_at: result.created_at,
      updated_at: result.updated_at,
    };

    // แยกข้อมูล country
    const countryData = result.country_id_mapped ? {
      id: result.country_id_mapped,
      code: result.country_code,
      name_en: result.country_name_en,
      name_th: result.country_name_th,
      type: result.country_type,
      percent_increase: result.country_percent_increase,
      created_at: result.country_created_at,
      updated_at: result.country_updated_at,
    } : null;

    // แยกข้อมูล currency
    const currencyData = result.currency_id_mapped ? {
      id: result.currency_id_mapped,
      currency_th: result.currency_th,
      currency_code_th: result.currency_code_th,
      currency_en: result.currency_en,
      currency_code_en: result.currency_code_en,
    } : null;

    // แปลงเป็น camelCase
    const mappedOffice = await toCamelCase<Partial<OfficeInternational>>(officeData);
    const mappedCountry = countryData ? await toCamelCase<Countries>(countryData) : undefined;
    const mappedCurrency = currencyData ? await toCamelCase<Currency>(currencyData) : undefined;

    return {
      ...mappedOffice,
      country: mappedCountry,
      currency: mappedCurrency,
    } as OfficeInternational;
  }

  async create(entity: Partial<OfficeInternational>): Promise<OfficeInternational> {
    const dbEntity = await toSnakeCase(entity);
    const created = await super.create(dbEntity);
    return await toCamelCase<OfficeInternational>(created);
  }

  async update(id: number, entity: Partial<OfficeInternational>): Promise<OfficeInternational> {
    const dbEntity = await toSnakeCase(entity);
    const updated = await super.update(id, dbEntity);
    return await toCamelCase<OfficeInternational>(updated);
  }

  async findById(id: number): Promise<OfficeInternational | undefined> {
    const dbEntity = await this.knexService
      .knex('office_international')
      .select(
        'office_international.id',
        'office_international.name',
        'office_international.region',
        'office_international.country_id',
        'office_international.currency_id',
        'office_international.created_at',
        'office_international.updated_at',
        'countries.id as country_id_mapped',
        'countries.code as country_code',
        'countries.name_en as country_name_en',
        'countries.name_th as country_name_th',
        'countries.type as country_type',
        'countries.percent_increase as country_percent_increase',
        'countries.created_at as country_created_at',
        'countries.updated_at as country_updated_at',
        'currencies.id as currency_id_mapped',
        'currencies.currency_th as currency_th',
        'currencies.currency_code_th as currency_code_th',
        'currencies.currency_en as currency_en',
        'currencies.currency_code_en as currency_code_en'
      )
      .leftJoin('countries', 'office_international.country_id', 'countries.id')
      .leftJoin('currencies', 'office_international.currency_id', 'currencies.id')
      .where('office_international.id', id)
      .first();

    return dbEntity ? this.mapResult(dbEntity) : undefined;
  }

  async findOne(conditions: Record<string, any>): Promise<OfficeInternational | undefined> {
    const dbEntity = await this.knexService
      .knex('office_international')
      .select(
        'office_international.id',
        'office_international.name',
        'office_international.region',
        'office_international.country_id',
        'office_international.currency_id',
        'office_international.created_at',
        'office_international.updated_at',
        'countries.id as country_id_mapped',
        'countries.code as country_code',
        'countries.name_en as country_name_en',
        'countries.name_th as country_name_th',
        'countries.type as country_type',
        'countries.percent_increase as country_percent_increase',
        'countries.created_at as country_created_at',
        'countries.updated_at as country_updated_at',
        'currencies.id as currency_id_mapped',
        'currencies.currency_th as currency_th',
        'currencies.currency_code_th as currency_code_th',
        'currencies.currency_en as currency_en',
        'currencies.currency_code_en as currency_code_en'
      )
      .leftJoin('countries', 'office_international.country_id', 'countries.id')
      .leftJoin('currencies', 'office_international.currency_id', 'currencies.id')
      .where(conditions)
      .first();

    return dbEntity ? this.mapResult(dbEntity) : undefined;
  }

  async find(conditions: Record<string, any> = {}): Promise<OfficeInternational[]> {
    const dbEntities = await this.knexService
      .knex('office_international')
      .select(
        'office_international.id',
        'office_international.name',
        'office_international.region',
        'office_international.country_id',
        'office_international.currency_id',
        'office_international.created_at',
        'office_international.updated_at',
        'countries.id as country_id_mapped',
        'countries.code as country_code',
        'countries.name_en as country_name_en',
        'countries.name_th as country_name_th',
        'countries.type as country_type',
        'countries.percent_increase as country_percent_increase',
        'countries.created_at as country_created_at',
        'countries.updated_at as country_updated_at',
        'currencies.id as currency_id_mapped',
        'currencies.currency_th as currency_th',
        'currencies.currency_code_th as currency_code_th',
        'currencies.currency_en as currency_en',
        'currencies.currency_code_en as currency_code_en'
      )
      .leftJoin('countries', 'office_international.country_id', 'countries.id')
      .leftJoin('currencies', 'office_international.currency_id', 'currencies.id')
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
    const baseQuery = this.knexService.knex('office_international')
      .select(
        'office_international.id',
        'office_international.name',
        'office_international.region',
        'office_international.country_id',
        'office_international.currency_id',
        'office_international.created_at',
        'office_international.updated_at',
        'countries.id as country_id_mapped',
        'countries.code as country_code',
        'countries.name_en as country_name_en',
        'countries.name_th as country_name_th',
        'countries.type as country_type',
        'countries.percent_increase as country_percent_increase',
        'countries.created_at as country_created_at',
        'countries.updated_at as country_updated_at',
        'currencies.id as currency_id_mapped',
        'currencies.currency_th as currency_th',
        'currencies.currency_code_th as currency_code_th',
        'currencies.currency_en as currency_en',
        'currencies.currency_code_en as currency_code_en'
      )
      .leftJoin('countries', 'office_international.country_id', 'countries.id')
      .leftJoin('currencies', 'office_international.currency_id', 'currencies.id');

    // Add search condition if searchTerm exists
    if (searchTerm) {
      baseQuery.where(function() {
        this.whereRaw('LOWER("office_international"."name") LIKE ?', [`%${searchTerm.toLowerCase()}%`])
          .orWhereRaw('LOWER("office_international"."region") LIKE ?', [`%${searchTerm.toLowerCase()}%`]);
      });
    }

    // Add other conditions
    if (Object.keys(otherConditions).length > 0) {
      baseQuery.where(otherConditions);
    }

    // Create separate count query
    const countQuery = this.knexService.knex('office_international')
      .count('* as total')
      .where(function() {
        if (searchTerm) {
          this.whereRaw('LOWER("office_international"."name") LIKE ?', [`%${searchTerm.toLowerCase()}%`])
            .orWhereRaw('LOWER("office_international"."region") LIKE ?', [`%${searchTerm.toLowerCase()}%`]);
        }
        if (Object.keys(otherConditions).length > 0) {
          this.where(otherConditions);
        }
      });

    // Get paginated data
    const dataQuery = baseQuery.clone()
      .orderBy(`office_international.${orderBy}`, direction)
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
    const baseQuery = this.knexService.knex('office_international')
      .select(
        'office_international.id',
        'office_international.name',
        'office_international.region',
        'office_international.country_id',
        'office_international.currency_id',
        'office_international.created_at',
        'office_international.updated_at',
        'countries.id as country_id_mapped',
        'countries.code as country_code',
        'countries.name_en as country_name_en',
        'countries.name_th as country_name_th',
        'countries.type as country_type',
        'countries.percent_increase as country_percent_increase',
        'countries.created_at as country_created_at',
        'countries.updated_at as country_updated_at',
        'currencies.id as currency_id_mapped',
        'currencies.currency_th as currency_th',
        'currencies.currency_code_th as currency_code_th',
        'currencies.currency_en as currency_en',
        'currencies.currency_code_en as currency_code_en'
      )
      .leftJoin('countries', 'office_international.country_id', 'countries.id')
      .leftJoin('currencies', 'office_international.currency_id', 'currencies.id');

    // Create count query
    const countQuery = this.knexService.knex('office_international')
      .count('* as count')
      .leftJoin('countries', 'office_international.country_id', 'countries.id')
      .leftJoin('currencies', 'office_international.currency_id', 'currencies.id');

    // Apply base conditions
    if (Object.keys(conditions).length > 0) {
      baseQuery.where(conditions);
      countQuery.where(conditions);
    }

    // Apply search term if provided
    if (searchTerm) {
      const searchCondition = function(builder) {
        builder.whereRaw('LOWER("office_international"."name") LIKE ?', [`%${searchTerm.toLowerCase()}%`])
          .orWhereRaw('LOWER("office_international"."region") LIKE ?', [`%${searchTerm.toLowerCase()}%`]);
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
      .orderBy(`office_international.${orderBy}`, direction)
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

  // Add custom repository methods here as needed
}
