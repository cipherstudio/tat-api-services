import { Injectable } from '@nestjs/common';
import { Countries } from '../entities/countries.entity';
import { KnexBaseRepository } from '../../../common/repositories/knex-base.repository';
import { KnexService } from '../../../database/knex-service/knex.service';
import { QueryCountriesDto } from '../dto/query-countries.dto';

@Injectable()
export class CountriesRepository extends KnexBaseRepository<Countries> {
  constructor(knexService: KnexService) {
    super(knexService, 'countries');
  }

  async find(query: QueryCountriesDto): Promise<Countries[]> {
    const { page = 1, limit = 10, orderBy = 'id', orderDir = 'DESC', code, name_en, name_th, searchTerm } = query;
    const offset = (page - 1) * limit;

    let queryBuilder = this.knexService.knex(this.tableName);

    if (code) {
      queryBuilder = queryBuilder.where('code', 'like', `%${code}%`);
    }

    if (name_en) {
      queryBuilder = queryBuilder.where('name_en', 'like', `%${name_en}%`);
    }

    if (name_th) {
      queryBuilder = queryBuilder.where('name_th', 'like', `%${name_th}%`);
    }

    if (searchTerm) {
      queryBuilder = queryBuilder.where((builder) => {
        builder
          .where('code', 'like', `%${searchTerm}%`)
          .orWhere('name_en', 'like', `%${searchTerm}%`)
          .orWhere('name_th', 'like', `%${searchTerm}%`);
      });
    }

    return queryBuilder
      .orderBy(orderBy, orderDir)
      .limit(limit)
      .offset(offset);
  }

  async count(query: QueryCountriesDto): Promise<number> {
    const { code, name_en, name_th, searchTerm } = query;

    let queryBuilder = this.knexService.knex(this.tableName);

    if (code) {
      queryBuilder = queryBuilder.where('code', 'like', `%${code}%`);
    }

    if (name_en) {
      queryBuilder = queryBuilder.where('name_en', 'like', `%${name_en}%`);
    }

    if (name_th) {
      queryBuilder = queryBuilder.where('name_th', 'like', `%${name_th}%`);
    }

    if (searchTerm) {
      queryBuilder = queryBuilder.where((builder) => {
        builder
          .where('code', 'like', `%${searchTerm}%`)
          .orWhere('name_en', 'like', `%${searchTerm}%`)
          .orWhere('name_th', 'like', `%${searchTerm}%`);
      });
    }

    const result = await queryBuilder.count('* as total').first();
    return Number(result.total);
  }

  // Add custom repository methods here as needed
}
