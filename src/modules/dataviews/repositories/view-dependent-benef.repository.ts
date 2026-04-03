import { Injectable } from '@nestjs/common';
import {
  ViewDependentBenef,
  ViewDependentBenefPaginate,
} from '../entities/view-dependent-benef.entity';
import { KnexBaseRepository } from '../../../common/repositories/knex-base.repository';
import { KnexService } from '../../../database/knex-service/knex.service';
import { toCamelCase } from '../../../common/utils/case-mapping';
import { QueryViewDependentBenefDto } from '../dto/query-view-dependent-benef.dto';

@Injectable()
export class ViewDependentBenefRepository extends KnexBaseRepository<ViewDependentBenef> {
  constructor(knexService: KnexService) {
    super(knexService, 'VIEW_DEPENDENT_BENEF');
  }

  async findWithQuery(
    query: QueryViewDependentBenefDto,
  ): Promise<ViewDependentBenefPaginate> {
    let builder = this.knex(this.tableName);

    if (query.depEmployeeCode) {
      builder = builder.whereRaw(
        'RTRIM("VIEW_DEPENDENT_BENEF"."DEP_EMPLOYEECODE") = ?',
        [String(query.depEmployeeCode).trim()],
      );
    }
    if (query.depRelation) {
      builder = builder.where(
        'DEP_RELATION',
        String(query.depRelation).trim(),
      );
    }
    if (query.depNationCardId) {
      builder = builder.whereRaw(
        'RTRIM("VIEW_DEPENDENT_BENEF"."DEP_NATIONCARDID") = ?',
        [String(query.depNationCardId).trim()],
      );
    }

    const countQuery = builder.clone();
    const countResult = await countQuery.count('* as count').first();
    const total = Number(countResult?.count || 0);

    if (query.limit !== undefined) builder = builder.limit(query.limit);
    if (query.offset !== undefined) builder = builder.offset(query.offset);

    const dbEntities = await builder.select();
    const data = await Promise.all(
      dbEntities.map(async (e) => await toCamelCase<ViewDependentBenef>(e)),
    );
    return {
      data,
      meta: {
        total,
        limit: query.limit ?? 10,
        offset: query.offset ?? 0,
      },
    };
  }

  async findByEmployeeCode(
    employeeCode: string,
  ): Promise<ViewDependentBenef[]> {
    const code = String(employeeCode ?? '').trim();
    if (!code) return [];

    const rows = await this.knex(this.tableName)
      .whereRaw('RTRIM("VIEW_DEPENDENT_BENEF"."DEP_EMPLOYEECODE") = ?', [code])
      .select();

    return Promise.all(
      rows.map(async (e) => await toCamelCase<ViewDependentBenef>(e)),
    );
  }
}
