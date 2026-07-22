import { Injectable } from '@nestjs/common';
import { KnexBaseRepository } from '../../../common/repositories/knex-base.repository';
import { KnexService } from '../../../database/knex-service/knex.service';
import { toCamelCase, toSnakeCase } from '../../../common/utils/case-mapping';
import { TrainingCountry } from '../entities/training-countries.entity';

@Injectable()
export class TrainingCountriesRepository extends KnexBaseRepository<TrainingCountry> {
  constructor(knexService: KnexService) { super(knexService, 'training_countries'); }

  async create(entity: Partial<TrainingCountry>): Promise<TrainingCountry> {
    return toCamelCase<TrainingCountry>(await super.create(await toSnakeCase(entity)));
  }

  async update(id: number, entity: Partial<TrainingCountry>): Promise<TrainingCountry> {
    return toCamelCase<TrainingCountry>(await super.update(id, await toSnakeCase(entity)));
  }

  async findById(id: number): Promise<TrainingCountry | undefined> {
    const entity = await super.findById(id);
    return entity ? toCamelCase<TrainingCountry>(entity) : undefined;
  }

  async findWithPaginationAndSearch(page = 1, limit = 10, orderBy = 'id', direction: 'asc' | 'desc' = 'asc', searchTerm?: string) {
    const query = this.knex(this.tableName);
    if (searchTerm) {
      query.where(builder => builder
        .whereRaw('LOWER("name_en") LIKE ?', [`%${searchTerm.toLowerCase()}%`])
        .orWhereRaw('"name_th" LIKE ?', [`%${searchTerm}%`])
        .orWhereRaw('LOWER("code") LIKE ?', [`%${searchTerm.toLowerCase()}%`])
        .orWhereRaw('LOWER("type") LIKE ?', [`%${searchTerm.toLowerCase()}%`]));
    }
    const total = Number((await query.clone().count('* as count').first())?.count || 0);
    const data = await query.orderBy(orderBy, direction).limit(limit).offset((page - 1) * limit);
    return { data: await Promise.all(data.map(row => toCamelCase<TrainingCountry>(row))), meta: { total, page, limit, lastPage: Math.ceil(total / limit) } };
  }
}
