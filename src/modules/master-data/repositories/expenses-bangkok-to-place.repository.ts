import { Injectable } from '@nestjs/common';
import { ExpensesBangkokToPlace } from '../entities/expenses-bangkok-to-place.entity';
import { KnexBaseRepository } from '../../../common/repositories/knex-base.repository';
import { KnexService } from '../../../database/knex-service/knex.service';
import { toCamelCase, toSnakeCase } from '../../../common/utils/case-mapping';

@Injectable()
export class ExpensesBangkokToPlaceRepository extends KnexBaseRepository<ExpensesBangkokToPlace> {
  constructor(knexService: KnexService) {
    super(knexService, 'expenses_bangkok_to_place');
  }

  async create(entity: Partial<ExpensesBangkokToPlace>): Promise<ExpensesBangkokToPlace> {
    const dbEntity = await toSnakeCase(entity);
    const created = await super.create(dbEntity);
    return await toCamelCase<ExpensesBangkokToPlace>(created);
  }

  async update(id: number, entity: Partial<ExpensesBangkokToPlace>): Promise<ExpensesBangkokToPlace> {
    const dbEntity = await toSnakeCase(entity);
    const updated = await super.update(id, dbEntity);
    return await toCamelCase<ExpensesBangkokToPlace>(updated);
  }

  async findOne(conditions: Record<string, any>): Promise<ExpensesBangkokToPlace | undefined> {
    const dbEntity = await super.findOne(conditions);
    return dbEntity ? await toCamelCase<ExpensesBangkokToPlace>(dbEntity) : undefined;
  }

  async find(conditions: Record<string, any> = {}): Promise<ExpensesBangkokToPlace[]> {
    const dbEntities = await super.find(conditions);
    return Promise.all(dbEntities.map(async (e) => await toCamelCase<ExpensesBangkokToPlace>(e)));
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
      query.where(conditions);
    }

    // Apply search term if provided
    if (searchTerm) {
      query.where((builder) => {
        builder.whereRaw('LOWER("name") LIKE ?', [`%${searchTerm.toLowerCase()}%`]);
      });
    }

    const offset = (page - 1) * limit;

    // Get total count with search conditions
    const countResult = await query.clone().count('* as count').first();
    const total = Number(countResult?.count || 0);

    // Get paginated data
    const data = await query
      .orderBy(orderBy, direction)
      .limit(limit)
      .offset(offset);

    return {
      data: await Promise.all(data.map(async (e) => await toCamelCase<ExpensesBangkokToPlace>(e))),
      meta: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async deleteByAmphurId(amphurId: number): Promise<void> {
    await this.knex(this.tableName).where({ amphur_id: amphurId }).del();
  }

  async bulkInsert(amphurId: number, rates: { placeId: number; rate: number }[]): Promise<any> {
    if (!rates || rates.length === 0) return [];
    const rows = rates.map(r => ({ amphur_id: amphurId, place_id: r.placeId, rate: r.rate }));
    return this.knex(this.tableName).insert(rows);
  }

  async findByAmphurId(amphurId: number): Promise<any[]> {
    return this.knex(this.tableName).where({ amphur_id: amphurId });
  }

  async findAllPlacesWithRateByAmphurId(amphurId: number): Promise<any[]> {
    const knex = this.knex;
    return knex('places')
      .leftJoin('expenses_bangkok_to_place', function () {
        this.on('places.id', '=', 'expenses_bangkok_to_place.place_id')
          .andOn('expenses_bangkok_to_place.amphur_id', '=', knex.raw('?', [amphurId]));
      })
      .select(
        'places.id as placeId',
        'places.name as placeName',
        'expenses_bangkok_to_place.rate'
      );
  }
} 