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

    // Base query with joins (เพิ่ม join กับ report_traveller)
    const baseQuery = this.knex('report_approve')
      .whereNull('report_approve.deleted_at')
      .leftJoin(
        'report_approve_status',
        'report_approve.status',
        'report_approve_status.id',
      )
      .leftJoin('approval', 'report_approve.approve_id', 'approval.id')
      .leftJoin(
        'report_traveller_form',
        'report_approve.id',
        'report_traveller_form.report_id',
      )
      .leftJoin(
        'report_traveller',
        'report_traveller_form.traveler_id',
        'report_traveller.traveler_id',
      )
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

    // 2. Get paginated data with all columns (select columns จากทั้ง 3 ตาราง)
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
        // report_traveller_form columns
        'report_traveller_form.form_id',
        'report_traveller_form.traveler_id',
        'report_traveller_form.report_id',
        'report_traveller_form.job',
        'report_traveller_form.department',
        'report_traveller_form.date',
        'report_traveller_form.travel_order',
        'report_traveller_form.travel_order_date',
        'report_traveller_form.companions',
        'report_traveller_form.destination',
        'report_traveller_form.location',
        'report_traveller_form.departure_place',
        'report_traveller_form.departure_date',
        'report_traveller_form.departure_time',
        'report_traveller_form.return_place',
        'report_traveller_form.return_date',
        'report_traveller_form.return_time',
        'report_traveller_form.total_time',
        'report_traveller_form.travel_details',
        'report_traveller_form.gran_total',
        'report_traveller_form.request_approve_amount',
        'report_traveller_form.remain_amount',
        'report_traveller_form.created_at as form_created_at',
        'report_traveller_form.updated_at as form_updated_at',
        // report_traveller columns (join)
        'report_traveller.name as traveller_name',
        'report_traveller.position as traveller_position',
        'report_traveller.level as traveller_level',
        'report_traveller.type as traveller_type',
        'report_traveller.report_id as traveller_report_id',
        'report_traveller.created_at as traveller_created_at',
        'report_traveller.updated_at as traveller_updated_at',
        'report_traveller.traveller_code as traveller_code',
      )
      .orderBy(`report_approve.${snakeCaseOrderBy}`, direction)
      .offset(offset)
      .limit(limit);

    // 3. แปลงข้อมูลเป็น camelCase
    const data = await Promise.all(rows.map((row) => toCamelCase<any>(row)));

    // 4. Group ข้อมูลให้ report_traveller_form เป็น array (และ embed traveller)
    const grouped = {};
    for (const row of data) {
      const id = row.id;
      if (!grouped[id]) {
        // ก๊อปปี้ข้อมูล report_approve
        grouped[id] = {
          id: row.id,
          title: row.title,
          creatorName: row.creatorName,
          creatorCode: row.creatorCode,
          documentNumber: row.documentNumber,
          approveId: row.approveId,
          status: row.status,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
          statusName: row.statusName,
          approvalId: row.approvalId,
          approvalName: row.approvalName,
          creatorPmtCode: row.creatorPmtCode,
          creatorNameTh: row.creatorNameTh,
          creatorNameEn: row.creatorNameEn,
          creatorPosition: row.creatorPosition,
          reportTravellerForm: [],
        };
      }
      // ถ้ามี form_id แสดงว่ามีข้อมูลฟอร์ม
      if (row.formId) {
        grouped[id].reportTravellerForm.push({
          formId: row.formId,
          travelerId: row.travelerId,
          reportId: row.reportId,
          job: row.job,
          department: row.department,
          date: row.date ? this.toOracleDateString(row.date) : null,
          travelOrder: row.travelOrder,
          travelOrderDate: row.travelOrderDate,
          companions: row.companions,
          destination: row.destination,
          location: row.location,
          departurePlace: row.departurePlace,
          departureDate: row.departureDate,
          departureTime: row.departureTime,
          returnPlace: row.returnPlace,
          returnDate: row.returnDate,
          returnTime: row.returnTime,
          totalTime: row.totalTime,
          travelDetails: row.travelDetails,
          granTotal: row.granTotal,
          requestApproveAmount: row.requestApproveAmount,
          remainAmount: row.remainAmount,
          createdAt: row.formCreatedAt,
          updatedAt: row.formUpdatedAt,
          traveller: {
            name: row.travellerName,
            position: row.travellerPosition,
            level: row.travellerLevel,
            type: row.travellerType,
            reportId: row.travellerReportId,
            createdAt: row.travellerCreatedAt,
            updatedAt: row.travellerUpdatedAt,
            code: row.travellerCode,
          },
        });
      }
    }

    return {
      data: Object.values(grouped),
      meta: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async findWithId(id: number) {
    const rows = await this.knex('report_approve')
      .whereNull('report_approve.deleted_at')
      .leftJoin(
        'report_approve_status',
        'report_approve.status',
        'report_approve_status.id',
      )
      .leftJoin('approval', 'report_approve.approve_id', 'approval.id')
      .leftJoin(
        'report_traveller_form',
        'report_approve.id',
        'report_traveller_form.report_id',
      )
      .leftJoin(
        'report_traveller',
        'report_traveller_form.traveler_id',
        'report_traveller.traveler_id',
      )
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
        // report_traveller_form columns
        'report_traveller_form.form_id',
        'report_traveller_form.traveler_id',
        'report_traveller_form.report_id as form_report_id',
        'report_traveller_form.job',
        'report_traveller_form.department',
        'report_traveller_form.date',
        'report_traveller_form.travel_order',
        'report_traveller_form.travel_order_date',
        'report_traveller_form.companions',
        'report_traveller_form.destination',
        'report_traveller_form.location',
        'report_traveller_form.departure_place',
        'report_traveller_form.departure_date',
        'report_traveller_form.departure_time',
        'report_traveller_form.return_place',
        'report_traveller_form.return_date',
        'report_traveller_form.return_time',
        'report_traveller_form.total_time',
        'report_traveller_form.travel_details',
        'report_traveller_form.gran_total',
        'report_traveller_form.request_approve_amount',
        'report_traveller_form.remain_amount',
        'report_traveller_form.created_at as form_created_at',
        'report_traveller_form.updated_at as form_updated_at',
        // report_traveller columns (join)
        'report_traveller.name as traveller_name',
        'report_traveller.position as traveller_position',
        'report_traveller.level as traveller_level',
        'report_traveller.type as traveller_type',
        'report_traveller.report_id as traveller_report_id',
        'report_traveller.created_at as traveller_created_at',
        'report_traveller.updated_at as traveller_updated_at',
        'report_traveller.traveller_code as traveller_code',
      )
      .where('report_approve.id', id);

    if (!rows || rows.length === 0)
      throw new NotFoundException('Record not found');

    const data = await Promise.all(rows.map((row) => toCamelCase<any>(row)));
    // Group ข้อมูลให้ report_traveller_form เป็น array (และ embed traveller)
    // เนื่องจาก id เดียว จะมี row เดียวใน grouped
    const row = data[0];
    const result = {
      id: row.id,
      title: row.title,
      creatorName: row.creatorName,
      creatorCode: row.creatorCode,
      documentNumber: row.documentNumber,
      approveId: row.approveId,
      status: row.status,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      statusName: row.statusName,
      approvalId: row.approvalId,
      approvalName: row.approvalName,
      creatorPmtCode: row.creatorPmtCode,
      creatorNameTh: row.creatorNameTh,
      creatorNameEn: row.creatorNameEn,
      creatorPosition: row.creatorPosition,
      reportTravellerForm: [],
    };
    for (const r of data) {
      if (r.formId) {
        result.reportTravellerForm.push({
          formId: r.formId,
          travelerId: r.travelerId,
          reportId: r.formReportId,
          job: r.job,
          department: r.department,
          date: r.date ? this.toOracleDateString(r.date) : null,
          travelOrder: r.travelOrder,
          travelOrderDate: r.travelOrderDate
            ? this.toOracleDateString(r.travelOrderDate)
            : null,
          companions: r.companions,
          destination: r.destination,
          location: r.location,
          departurePlace: r.departurePlace,
          departureDate: r.departureDate
            ? this.toOracleDateString(r.departureDate)
            : null,
          departureTime: r.departureTime,
          returnPlace: r.returnPlace,
          returnDate: r.returnDate
            ? this.toOracleDateString(r.returnDate)
            : null,
          returnTime: r.returnTime,
          totalTime: r.totalTime,
          travelDetails: r.travelDetails,
          granTotal: r.granTotal,
          requestApproveAmount: r.requestApproveAmount,
          remainAmount: r.remainAmount,
          createdAt: r.formCreatedAt,
          updatedAt: r.formUpdatedAt,
          traveller: {
            name: r.travellerName,
            position: r.travellerPosition,
            level: r.travellerLevel,
            type: r.travellerType,
            reportId: r.travellerReportId,
            createdAt: r.travellerCreatedAt,
            updatedAt: r.travellerUpdatedAt,
            code: r.travellerCode,
          },
        });
      }
    }
    return result;
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

  toOracleDateString(date: Date | string) {
    if (!date) return null;
    if (date instanceof Date) {
      //convert to thai timezone
      const thaiDate = new Date(date.getTime() + 7 * 60 * 60 * 1000);
      //format to YYYY-MM-DD
      return thaiDate.toISOString().slice(0, 10);
      // //format to DD/MM/YYYY
      // return thaiDate.toLocaleDateString('th-TH', {
      //   day: '2-digit',
      //   month: '2-digit',
      //   year: 'numeric',
      // });
    }
    if (typeof date === 'string' && date.length >= 10) {
      //convert to thai timezone
      const thaiDate = new Date(date.slice(0, 10) + 'T00:00:00Z');
      //format to YYYY-MM-DD
      return thaiDate.toISOString().slice(0, 10);
      // //format to DD/MM/YYYY
      // return thaiDate.toLocaleDateString('th-TH', {
      //   day: '2-digit',
      //   month: '2-digit',
      //   year: 'numeric',
      // });
    }
    return date;
  }
}
