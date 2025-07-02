import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { KnexBaseRepository } from 'src/common/repositories/knex-base.repository';
import { ReportApprove } from '../entities/report-approve.entity';
import { KnexService } from 'src/database/knex-service/knex.service';
import { toSnakeCase, toCamelCase } from 'src/common/utils/case-mapping';
import { CreateReportApproveDto } from '../dto/create-report-approve.dto';

@Injectable()
export class ReportApproveRepository extends KnexBaseRepository<ReportApprove> {
  constructor(
    @Inject(KnexService) protected readonly knexService: KnexService,
  ) {
    super(knexService, 'report_approve');
  }

  async findWithPaginationAndSearch(
    page: number = 1,
    limit: number = 10,
    conditions: Record<string, any> = {},
    orderBy: string = 'created_at',
    direction: 'asc' | 'desc' = 'desc',
  ) {
    const filter = { ...conditions };
    const dbFilter = await toSnakeCase(filter);
    const offset = (page - 1) * limit;

    // Convert orderBy to snake_case if it's in camelCase
    const snakeCaseOrderBy = orderBy.replace(
      /[A-Z]/g,
      (letter) => `_${letter.toLowerCase()}`,
    );

    // Base query with joins
    const baseQuery = this.knex('report_approve')
      .whereNull('report_approve.deleted_at')
      .leftJoin(
        'report_approve_status',
        'report_approve.status',
        'report_approve_status.id',
      )
      .leftJoin('approval', 'report_approve.approve_id', 'approval.id')
      .leftJoin('OP_MASTER_T', (builder) => {
        builder.on(
          'report_approve.creator_code',
          '=',
          this.knex.raw('RTRIM("OP_MASTER_T"."PMT_CODE")'),
        );
      });

    // Apply filters if any
    if (Object.keys(dbFilter).length > 0) {
      // Prefix table name for status to avoid ambiguity
      if (dbFilter.status) {
        baseQuery.where('report_approve.status', dbFilter.status);
        delete dbFilter.status;
      }
      baseQuery.where(dbFilter);
    }

    // 1. Get total count using a separate count query with DISTINCT
    const countQuery = baseQuery
      .clone()
      .countDistinct('report_approve.id as count');
    const countResult = await countQuery.first();
    const total = Number(countResult?.count || 0);

    // 2. Get paginated data with all columns
    const rows = await baseQuery
      .distinct(
        // Report Approve columns
        'report_approve.id',
        'report_approve.title',
        'report_approve.creator_name',
        'report_approve.creator_code',
        'report_approve.document_number',
        'report_approve.approve_id',
        'report_approve.status',
        'report_approve.created_at',
        'report_approve.updated_at',
        // Status columns
        'report_approve_status.status as status_name',
        // Approval columns with aliases
        'approval.id as approval_id',
        'approval.name as approval_name',
        // OP_MASTER_T columns with aliases
        'OP_MASTER_T.PMT_CODE as creator_pmt_code',
        'OP_MASTER_T.PMT_NAME_T as creator_name_th',
        'OP_MASTER_T.PMT_NAME_E as creator_name_en',
        'OP_MASTER_T.PMT_POS_NO as creator_position',
      )
      .orderBy(`report_approve.${snakeCaseOrderBy}`, direction)
      .offset(offset)
      .limit(limit);

    // 3. Transform data to camelCase
    const data = await Promise.all(
      rows.map((row) => toCamelCase<ReportApprove>(row)),
    );

    return {
      data,
      meta: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async findWithId(id: number) {
    const row = await this.knex('report_approve')
      .whereNull('report_approve.deleted_at')
      .leftJoin(
        'report_approve_status',
        'report_approve.status',
        'report_approve_status.id',
      )
      .leftJoin('approval', 'report_approve.approve_id', 'approval.id')
      .leftJoin('OP_MASTER_T', (builder) => {
        builder.on(
          'report_approve.creator_code',
          '=',
          this.knex.raw('RTRIM("OP_MASTER_T"."PMT_CODE")'),
        );
      })
      .select(
        // Report Approve columns
        'report_approve.id',
        'report_approve.title',
        'report_approve.creator_name',
        'report_approve.creator_code',
        'report_approve.document_number',
        'report_approve.approve_id',
        'report_approve.status',
        'report_approve.created_at',
        'report_approve.updated_at',
        // Status columns
        'report_approve_status.status as status_name',
        // Approval columns with aliases
        'approval.id as approval_id',
        'approval.name as approval_name',
        // OP_MASTER_T columns with aliases
        'OP_MASTER_T.PMT_CODE as creator_pmt_code',
        'OP_MASTER_T.PMT_NAME_T as creator_name_th',
        'OP_MASTER_T.PMT_NAME_E as creator_name_en',
        'OP_MASTER_T.PMT_POS_NO as creator_position',
      )
      .where('report_approve.id', id)
      .first();
    if (!row) throw new NotFoundException('Record not found');
    return toCamelCase<ReportApprove>(row);
  }

  async create(dto: CreateReportApproveDto) {
    dto.documentNumber = await this.generateDocumentNumber();
    dto.status = 1; //default status is draft

    console.log('dto', dto);

    const snakeData = await toSnakeCase(dto);
    const row = await this.knex('report_approve')
      .insert(snakeData)
      .returning('*');

    const data = await this.findWithId(row[0].id);

    return data;
  }

  //function generate document number in format REYYMM00001 YY and MM in Thai timezone and this year
  async generateDocumentNumber() {
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;

    const thaiYear = year + 543;
    //get last 2 digit of thai year
    const last2DigitYear = thaiYear.toString().slice(-2);
    const monthStr = month.toString().padStart(2, '0');

    const lastDocumentNumber = await this.knex('report_approve')
      .where('document_number', 'like', `RE${last2DigitYear}${monthStr}%`)
      .orderBy('id', 'desc')
      .first();

    let documentNumber = `RE${last2DigitYear}${monthStr}00001`;

    if (lastDocumentNumber?.document_number) {
      // Extract the running number (last 5 digits)
      const lastRunningNumber = parseInt(
        lastDocumentNumber.document_number.slice(-5),
      );
      const newRunningNumber = lastRunningNumber + 1;
      documentNumber = `RE${last2DigitYear}${monthStr}${newRunningNumber.toString().padStart(5, '0')}`;
    }

    return documentNumber;
  }

  async softDelete(id: number) {
    const row = await this.findWithId(id);
    if (!row) throw new NotFoundException('Record not found');

    await this.knex('report_approve')
      .where('id', id)
      .update({ deleted_at: new Date() });

    return {
      message: 'Record deleted successfully',
    };
  }
}
