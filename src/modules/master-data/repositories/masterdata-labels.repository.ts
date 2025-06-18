import { Injectable, NotFoundException } from '@nestjs/common';
import { KnexBaseRepository } from '../../../common/repositories/knex-base.repository';
import { KnexService } from '../../../database/knex-service/knex.service';
import { MasterdataLabel } from '../entities/masterdata-labels.entity';
import { toSnakeCase, toCamelCase } from '../../../common/utils/case-mapping';

@Injectable()
export class MasterdataLabelsRepository extends KnexBaseRepository<MasterdataLabel> {
  constructor(knexService: KnexService) {
    super(knexService, 'masterdata_labels');
  }

  async findWithPaginationAndSearch(
    page: number = 1,
    limit: number = 10,
    conditions: Record<string, any> = {},
    orderBy: string = 'created_at',
    direction: 'asc' | 'desc' = 'desc',
  ) {
    const filter = { ...conditions };
    const dbFilter: Record<string, any> = {};

    // แปลงชื่อ field ให้ตรงกับ database
    if (filter.table_name) dbFilter.table_name = filter.table_name;
    if (filter.table_description)
      dbFilter.table_description = filter.table_description;
    if (filter.document_reference)
      dbFilter.document_reference = filter.document_reference;
    if (filter.document_name) dbFilter.document_name = filter.document_name;
    if (filter.document_date) dbFilter.document_date = filter.document_date;
    if (filter.document_url) dbFilter.document_url = filter.document_url;
    if (filter.updated_by) dbFilter.updated_by = filter.updated_by;

    const offset = (page - 1) * limit;

    try {
      // Count total records
      const countResult = await this.knex(this.tableName)
        .where(dbFilter)
        .count('* as count')
        .first();
      const total = Number(countResult?.count || 0);

      // Get paginated data
      const rows = await this.knex(this.tableName)
        .where(dbFilter)
        .orderBy(orderBy, direction)
        .offset(offset)
        .limit(limit)
        .select([
          'id',
          'table_name',
          'table_description',
          'document_reference',
          'document_name',
          'document_date',
          'document_url',
          'updated_by',
          'created_at',
          'updated_at',
        ]);

      // Transform data to camelCase
      const data = rows.map((row) => ({
        id: row.id,
        tableName: row.table_name,
        tableDescription: row.table_description,
        documentReference: row.document_reference,
        documentName: row.document_name,
        documentDate: row.document_date,
        documentUrl: row.document_url,
        updatedBy: row.updated_by,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));

      return {
        data,
        meta: {
          total,
          page,
          limit,
          lastPage: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('Error in findWithPaginationAndSearch:', error);
      throw error;
    }
  }

  async getWithTableName(tableName: string): Promise<MasterdataLabel | null> {
    const result = await this.knex(this.tableName)
      .where('table_name', tableName)
      .orderBy('created_at', 'desc')
      .first();

    if (!result) {
      throw new NotFoundException('Masterdata label not found');
    }

    return result ? toCamelCase(result) : null;
  }

  async create(data: Partial<MasterdataLabel>): Promise<MasterdataLabel> {
    const snakeCaseData = toSnakeCase(data);
    const [result] = await this.knex(this.tableName)
      .insert(snakeCaseData)
      .returning('*');
    return toCamelCase(result);
  }

  async update(
    id: number,
    data: Partial<MasterdataLabel>,
  ): Promise<MasterdataLabel> {
    const snakeCaseData = toSnakeCase(data);
    const [result] = await this.knex(this.tableName)
      .where('id', id)
      .update(snakeCaseData)
      .returning('*');
    return toCamelCase(result);
  }
}
