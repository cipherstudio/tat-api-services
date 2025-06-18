import { Injectable } from '@nestjs/common';
import { KnexBaseRepository } from '../../../common/repositories/knex-base.repository';
import { AttireDestinationGroups } from '../entities/attire-destination-groups.entity';
import { KnexService } from '../../../database/knex-service/knex.service';
import { toCamelCase, toSnakeCase } from '../../../common/utils/case-mapping';

@Injectable()
export class AttireDestinationGroupsRepository extends KnexBaseRepository<AttireDestinationGroups> {
  constructor(knexService: KnexService) {
    super(knexService, 'attire_destination_groups');
  }

  async create(entity: Partial<AttireDestinationGroups>): Promise<AttireDestinationGroups> {
    const { countryIds, ...groupData } = entity as any;
    const dbEntity = await toSnakeCase(groupData);
    
    return this.knex.transaction(async (trx) => {
      // Create the group
      const [groupId] = await trx(this.tableName)
        .insert(dbEntity)
        .returning('id');
      
      const actualGroupId = typeof groupId === 'object' ? groupId.id : groupId;

      // Create country associations if provided
      if (countryIds && countryIds.length > 0) {
        const countryAssociations = countryIds.map((countryId: number) => ({
          destination_group_id: actualGroupId,
          country_id: countryId,
        }));
        
        await trx('attire_destination_group_countries').insert(countryAssociations);
      }

      // Return the created group with countries
      return this.findByIdWithCountries(actualGroupId, trx);
    });
  }

  async update(id: number, entity: Partial<AttireDestinationGroups>): Promise<AttireDestinationGroups> {
    const { countryIds, ...groupData } = entity as any;
    const dbEntity = await toSnakeCase(groupData);

    return this.knex.transaction(async (trx) => {
      // Update the group
      await trx(this.tableName).where('id', id).update(dbEntity);

      // Update country associations if provided
      if (countryIds !== undefined) {
        // Remove existing associations
        await trx('attire_destination_group_countries')
          .where('destination_group_id', id)
          .delete();

        // Add new associations if any
        if (countryIds.length > 0) {
          const countryAssociations = countryIds.map((countryId: number) => ({
            destination_group_id: id,
            country_id: countryId,
          }));
          
          await trx('attire_destination_group_countries').insert(countryAssociations);
        }
      }

      // Return the updated group with countries
      return this.findByIdWithCountries(id, trx);
    });
  }

  async findByIdWithCountries(id: number, trx?: any): Promise<AttireDestinationGroups | undefined> {
    const knexInstance = trx || this.knex;
    
    // Get the group
    const group = await knexInstance(this.tableName)
      .where('id', id)
      .first();

    if (!group) {
      return undefined;
    }

    // Get associated countries
    const countries = await knexInstance('attire_destination_group_countries as adgc')
      .join('countries as c', 'adgc.country_id', 'c.id')
      .where('adgc.destination_group_id', id)
      .select('c.id', 'c.code', 'c.name_en', 'c.name_th');

    const groupCamelCase = await toCamelCase<AttireDestinationGroups>(group);
    const countriesCamelCase = await Promise.all(
      countries.map(async (country) => await toCamelCase(country))
    );

    return {
      ...groupCamelCase,
      countries: countriesCamelCase,
    };
  }

  async findById(id: number): Promise<AttireDestinationGroups | undefined> {
    return this.findByIdWithCountries(id);
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
        if (value === null) {
          query.whereNull(key);
        } else if (value !== undefined) {
          query.where(key, value);
        }
      });
    }

    // Apply search term if provided
    if (searchTerm) {
      query.where((builder) => {
        builder
          .whereRaw('LOWER("group_name") LIKE ?', [`%${searchTerm.toLowerCase()}%`])
          .orWhereRaw('LOWER("group_code") LIKE ?', [`%${searchTerm.toLowerCase()}%`])
          .orWhereRaw('LOWER("description") LIKE ?', [`%${searchTerm.toLowerCase()}%`]);
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
    const groups = await query
      .orderBy(dbOrderByKey, direction)
      .limit(limit)
      .offset(offset);

    // Get countries for these groups
    const groupIds = groups.map(g => g.id);
    const countries = groupIds.length > 0 ? await this.knex('attire_destination_group_countries as adgc')
      .join('countries as c', 'adgc.country_id', 'c.id')
      .whereIn('adgc.destination_group_id', groupIds)
      .select('adgc.destination_group_id', 'c.id', 'c.code', 'c.name_en', 'c.name_th') : [];

    // Group countries by destination_group_id
    const countriesByGroupId = countries.reduce((acc, country) => {
      const groupId = country.destination_group_id;
      if (!acc[groupId]) {
        acc[groupId] = [];
      }
      acc[groupId].push({
        id: country.id,
        code: country.code,
        nameEn: country.name_en,
        nameTh: country.name_th,
      });
      return acc;
    }, {} as Record<number, any[]>);

    // Combine groups with their countries
    const dataWithCountries = await Promise.all(
      groups.map(async (group) => {
        const groupCamelCase = await toCamelCase<AttireDestinationGroups>(group);
        return {
          ...groupCamelCase,
          countries: countriesByGroupId[group.id] || [],
        };
      })
    );

    return {
      data: dataWithCountries,
      meta: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async findByAssignmentType(type: string): Promise<AttireDestinationGroups[]> {
    const groups = await this.knex(this.tableName)
      .where('assignment_type', type)
      .select('*');

    // Get countries for these groups
    const groupIds = groups.map(g => g.id);
    const countries = groupIds.length > 0 ? await this.knex('attire_destination_group_countries as adgc')
      .join('countries as c', 'adgc.country_id', 'c.id')
      .whereIn('adgc.destination_group_id', groupIds)
      .select('adgc.destination_group_id', 'c.id', 'c.code', 'c.name_en', 'c.name_th') : [];

    // Group countries by destination_group_id
    const countriesByGroupId = countries.reduce((acc, country) => {
      const groupId = country.destination_group_id;
      if (!acc[groupId]) {
        acc[groupId] = [];
      }
      acc[groupId].push({
        id: country.id,
        code: country.code,
        nameEn: country.name_en,
        nameTh: country.name_th,
      });
      return acc;
    }, {} as Record<number, any[]>);

    return Promise.all(
      groups.map(async (group) => {
        const groupCamelCase = await toCamelCase<AttireDestinationGroups>(group);
        return {
          ...groupCamelCase,
          countries: countriesByGroupId[group.id] || [],
        };
      })
    );
  }

  async findAllWithCountries(): Promise<AttireDestinationGroups[]> {
    // Get all groups
    const groups = await this.knex(this.tableName).select('*');

    // Get all country associations in one query
    const allCountries = await this.knex('attire_destination_group_countries as adgc')
      .join('countries as c', 'adgc.country_id', 'c.id')
      .select('adgc.destination_group_id', 'c.id', 'c.code', 'c.name_en', 'c.name_th');

    // Group countries by destination_group_id
    const countriesByGroupId = allCountries.reduce((acc, country) => {
      const groupId = country.destination_group_id;
      if (!acc[groupId]) {
        acc[groupId] = [];
      }
      acc[groupId].push({
        id: country.id,
        code: country.code,
        nameEn: country.name_en,
        nameTh: country.name_th,
      });
      return acc;
    }, {} as Record<number, any[]>);

    // Combine groups with their countries
    return Promise.all(
      groups.map(async (group) => {
        const groupCamelCase = await toCamelCase<AttireDestinationGroups>(group);
        return {
          ...groupCamelCase,
          countries: countriesByGroupId[group.id] || [],
        };
      })
    );
  }
} 