import { Injectable } from '@nestjs/common';
import { KnexBaseRepository } from '../../../common/repositories/knex-base.repository';
import { AttireAllowanceRates } from '../entities/attire-allowance-rates.entity';
import { KnexService } from '../../../database/knex-service/knex.service';
import { toCamelCase, toSnakeCase } from '../../../common/utils/case-mapping';

@Injectable()
export class AttireAllowanceRatesRepository extends KnexBaseRepository<AttireAllowanceRates> {
  constructor(knexService: KnexService) {
    super(knexService, 'attire_allowance_rates');
  }

  async create(
    entity: Partial<AttireAllowanceRates>,
  ): Promise<AttireAllowanceRates> {
    const dbEntity = await toSnakeCase(entity);
    const created = await super.create(dbEntity);
    return this.findByIdWithDestinationGroup(created.id);
  }

  async update(
    id: number,
    entity: Partial<AttireAllowanceRates>,
  ): Promise<AttireAllowanceRates> {
    const dbEntity = await toSnakeCase(entity);
    await super.update(id, dbEntity);
    return this.findByIdWithDestinationGroup(id);
  }

  async findByIdWithDestinationGroup(id: number): Promise<AttireAllowanceRates | undefined> {
    const result = await this.knex(this.tableName + ' as aar')
      .leftJoin('attire_destination_groups as adg', 'aar.destination_group_code', 'adg.group_code')
      .where('aar.id', id)
      .select(
        'aar.*',
        'adg.id as destination_group_id',
        'adg.group_code as destination_group_code_info',
        'adg.group_name as destination_group_name',
        'adg.assignment_type as destination_group_assignment_type',
        'adg.description as destination_group_description'
      )
      .first();

    if (!result) {
      return undefined;
    }

    // Transform the result
    const allowanceRate = await toCamelCase<AttireAllowanceRates>({
      id: result.id,
      assignment_type: result.assignment_type,
      position_name: result.position_name,
      level_code_start: result.level_code_start,
      level_code_end: result.level_code_end,
      destination_group_code: result.destination_group_code,
      rate_thb: result.rate_thb,
      spouse_rate_thb: result.spouse_rate_thb,
      child_rate_thb: result.child_rate_thb,
      created_at: result.created_at,
      updated_at: result.updated_at,
    });

    // Add destination group info if exists
    if (result.destination_group_id) {
      allowanceRate.destinationGroup = await toCamelCase({
        id: result.destination_group_id,
        group_code: result.destination_group_code_info,
        group_name: result.destination_group_name,
        assignment_type: result.destination_group_assignment_type,
        description: result.destination_group_description,
      });
    }

    return allowanceRate;
  }

  async findById(id: number): Promise<AttireAllowanceRates | undefined> {
    return this.findByIdWithDestinationGroup(id);
  }

  async findOne(
    conditions: Record<string, any>,
  ): Promise<AttireAllowanceRates | undefined> {
    const dbConditions = await toSnakeCase(conditions);
    const result = await this.knex(this.tableName + ' as aar')
      .leftJoin('attire_destination_groups as adg', 'aar.destination_group_code', 'adg.group_code')
      .where(dbConditions)
      .select(
        'aar.*',
        'adg.id as destination_group_id',
        'adg.group_code as destination_group_code_info',
        'adg.group_name as destination_group_name',
        'adg.assignment_type as destination_group_assignment_type',
        'adg.description as destination_group_description'
      )
      .first();

    if (!result) {
      return undefined;
    }

    // Transform the result
    const allowanceRate = await toCamelCase<AttireAllowanceRates>({
      id: result.id,
      assignment_type: result.assignment_type,
      position_name: result.position_name,
      level_code_start: result.level_code_start,
      level_code_end: result.level_code_end,
      destination_group_code: result.destination_group_code,
      rate_thb: result.rate_thb,
      spouse_rate_thb: result.spouse_rate_thb,
      child_rate_thb: result.child_rate_thb,
      created_at: result.created_at,
      updated_at: result.updated_at,
    });

    // Add destination group info if exists
    if (result.destination_group_id) {
      allowanceRate.destinationGroup = await toCamelCase({
        id: result.destination_group_id,
        group_code: result.destination_group_code_info,
        group_name: result.destination_group_name,
        assignment_type: result.destination_group_assignment_type,
        description: result.destination_group_description,
      });
    }

    return allowanceRate;
  }

  async findWithPaginationAndSearch(
    page: number = 1,
    limit: number = 10,
    conditions: Record<string, any> = {},
    orderBy: string = 'id',
    direction: 'asc' | 'desc' = 'asc',
    searchTerm?: string,
  ) {
    const query = this.knex(this.tableName + ' as aar')
      .leftJoin('attire_destination_groups as adg', 'aar.destination_group_code', 'adg.group_code');

    // Apply base conditions
    if (Object.keys(conditions).length > 0) {
      const dbConditions = await toSnakeCase(conditions);
      Object.entries(dbConditions).forEach(([key, value]) => {
        if (value === null) {
          query.whereNull(`aar.${key}`);
        } else if (
          value !== undefined &&
          key !== 'level_code_start' &&
          key !== 'level_code_end'
        ) {
          query.where(`aar.${key}`, value);
        }
      });
    }

    // Apply search term if provided
    if (searchTerm) {
      query.where((builder) => {
        builder
          .whereRaw('LOWER(aar."assignment_type") LIKE ?', [
            `%${searchTerm.toLowerCase()}%`,
          ])
          .orWhereRaw('LOWER(aar."destination_group_code") LIKE ?', [
            `%${searchTerm.toLowerCase()}%`,
          ])
          .orWhereRaw('LOWER(adg."group_name") LIKE ?', [
            `%${searchTerm.toLowerCase()}%`,
          ]);
      });
    }

    const offset = (page - 1) * limit;

    // Get total count with search conditions
    const countResult = await query.clone().count('aar.id as count').first();
    const total = Number(countResult?.count || 0);

    // Convert orderBy to snake_case for database
    const dbOrderBy = await toSnakeCase({ [orderBy]: null });
    const dbOrderByKey = Object.keys(dbOrderBy)[0];

    // Get paginated data
    const results = await query
      .select(
        'aar.*',
        'adg.id as destination_group_id',
        'adg.group_code as destination_group_code_info',
        'adg.group_name as destination_group_name',
        'adg.assignment_type as destination_group_assignment_type',
        'adg.description as destination_group_description'
      )
      .orderBy(`aar.${dbOrderByKey}`, direction)
      .limit(limit)
      .offset(offset);

    // Transform results
    const transformedData = await Promise.all(
      results.map(async (result) => {
        const allowanceRate = await toCamelCase<AttireAllowanceRates>({
          id: result.id,
          assignment_type: result.assignment_type,
          position_name: result.position_name,
          level_code_start: result.level_code_start,
          level_code_end: result.level_code_end,
          destination_group_code: result.destination_group_code,
          rate_thb: result.rate_thb,
          spouse_rate_thb: result.spouse_rate_thb,
          child_rate_thb: result.child_rate_thb,
          created_at: result.created_at,
          updated_at: result.updated_at,
        });

        // Add destination group info if exists
        if (result.destination_group_id) {
          allowanceRate.destinationGroup = await toCamelCase({
            id: result.destination_group_id,
            group_code: result.destination_group_code_info,
            group_name: result.destination_group_name,
            assignment_type: result.destination_group_assignment_type,
            description: result.destination_group_description,
          });
        }

        return allowanceRate;
      })
    );

    return {
      data: transformedData,
      meta: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async findByAssignmentType(type: string): Promise<AttireAllowanceRates[]> {
    const results = await this.knex(this.tableName + ' as aar')
      .leftJoin('attire_destination_groups as adg', 'aar.destination_group_code', 'adg.group_code')
      .where('aar.assignment_type', type)
      .select(
        'aar.*',
        'adg.id as destination_group_id',
        'adg.group_code as destination_group_code_info',
        'adg.group_name as destination_group_name',
        'adg.assignment_type as destination_group_assignment_type',
        'adg.description as destination_group_description'
      );

    return Promise.all(
      results.map(async (result) => {
        const allowanceRate = await toCamelCase<AttireAllowanceRates>({
          id: result.id,
          assignment_type: result.assignment_type,
          position_name: result.position_name,
          level_code_start: result.level_code_start,
          level_code_end: result.level_code_end,
          destination_group_code: result.destination_group_code,
          rate_thb: result.rate_thb,
          spouse_rate_thb: result.spouse_rate_thb,
          child_rate_thb: result.child_rate_thb,
          created_at: result.created_at,
          updated_at: result.updated_at,
        });

        // Add destination group info if exists
        if (result.destination_group_id) {
          allowanceRate.destinationGroup = await toCamelCase({
            id: result.destination_group_id,
            group_code: result.destination_group_code_info,
            group_name: result.destination_group_name,
            assignment_type: result.destination_group_assignment_type,
            description: result.destination_group_description,
          });
        }

        return allowanceRate;
      })
    );
  }

  async findByDestinationGroupCode(code: string): Promise<AttireAllowanceRates[]> {
    const results = await this.knex(this.tableName + ' as aar')
      .leftJoin('attire_destination_groups as adg', 'aar.destination_group_code', 'adg.group_code')
      .where('aar.destination_group_code', code)
      .select(
        'aar.*',
        'adg.id as destination_group_id',
        'adg.group_code as destination_group_code_info',
        'adg.group_name as destination_group_name',
        'adg.assignment_type as destination_group_assignment_type',
        'adg.description as destination_group_description'
      );

    return Promise.all(
      results.map(async (result) => {
        const allowanceRate = await toCamelCase<AttireAllowanceRates>({
          id: result.id,
          assignment_type: result.assignment_type,
          position_name: result.position_name,
          level_code_start: result.level_code_start,
          level_code_end: result.level_code_end,
          destination_group_code: result.destination_group_code,
          rate_thb: result.rate_thb,
          spouse_rate_thb: result.spouse_rate_thb,
          child_rate_thb: result.child_rate_thb,
          created_at: result.created_at,
          updated_at: result.updated_at,
        });

        // Add destination group info if exists
        if (result.destination_group_id) {
          allowanceRate.destinationGroup = await toCamelCase({
            id: result.destination_group_id,
            group_code: result.destination_group_code_info,
            group_name: result.destination_group_name,
            assignment_type: result.destination_group_assignment_type,
            description: result.destination_group_description,
          });
        }

        return allowanceRate;
      })
    );
  }
}
