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

    // 1. Query id เฉพาะหน้าที่ต้องการ
    const idQuery = this.knex('report_approve').whereNull(
      'report_approve.deleted_at',
    );
    if (Object.keys(dbFilter).length > 0) {
      if (dbFilter.status) {
        idQuery.where('report_approve.status', dbFilter.status);
        delete dbFilter.status;
      }
      idQuery.where(dbFilter);
    }
    const countResult = await idQuery
      .clone()
      .countDistinct('report_approve.id as count')
      .first();
    const total = Number(countResult?.count || 0);
    const idRows = await idQuery
      .clone()
      .orderBy(`report_approve.${snakeCaseOrderBy}`, direction)
      .limit(limit)
      .offset(offset)
      .pluck('id');
    if (idRows.length === 0) {
      return {
        data: [],
        meta: {
          total,
          page,
          limit,
          lastPage: Math.ceil(total / limit),
        },
      };
    }

    // 2. join ตารางอื่นๆ โดย whereIn idRows
    const rows = await this.knex('report_approve')
      .whereIn('report_approve.id', idRows)
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
      .leftJoin(
        'report_daily_travel_detail',
        'report_traveller_form.form_id',
        'report_daily_travel_detail.form_id',
      )
      .leftJoin(
        'report_holiday_wage_detail',
        'report_traveller_form.form_id',
        'report_holiday_wage_detail.form_id',
      )
      .leftJoin(
        'report_accommodation',
        'report_traveller_form.form_id',
        'report_accommodation.form_id',
      )
      .leftJoin(
        'report_other_expense',
        'report_traveller_form.form_id',
        'report_other_expense.form_id',
      )
      .leftJoin(
        'report_transportation',
        'report_traveller_form.form_id',
        'report_transportation.form_id',
      )
      .leftJoin(
        'report_allowance',
        'report_traveller_form.form_id',
        'report_allowance.form_id',
      )
      .leftJoin('OP_MASTER_T', (builder) => {
        builder.on(
          'report_approve.creator_code',
          '=',
          this.knex.raw('RTRIM("OP_MASTER_T"."PMT_CODE")'),
        );
      })
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
        'report_traveller.traveler_id as traveller_traveler_id',
        // report_daily_travel_detail columns
        'report_daily_travel_detail.detail_id as daily_travel_detail_id',
        'report_daily_travel_detail.form_id as daily_travel_detail_form_id',
        'report_daily_travel_detail.departure_place as daily_travel_detail_departure_place',
        'report_daily_travel_detail.departure_date as daily_travel_detail_departure_date',
        'report_daily_travel_detail.departure_time as daily_travel_detail_departure_time',
        'report_daily_travel_detail.return_place as daily_travel_detail_return_place',
        'report_daily_travel_detail.return_date as daily_travel_detail_return_date',
        'report_daily_travel_detail.return_time as daily_travel_detail_return_time',
        'report_daily_travel_detail.travel_details as daily_travel_detail_travel_details',
        // report_holiday_wage_detail columns
        'report_holiday_wage_detail.holiday_id as holiday_wage_detail_id',
        'report_holiday_wage_detail.form_id as holiday_wage_detail_form_id',
        'report_holiday_wage_detail.date as holiday_wage_detail_date',
        'report_holiday_wage_detail.hours as holiday_wage_detail_hours',
        'report_holiday_wage_detail.year as holiday_wage_detail_year',
        'report_holiday_wage_detail.wage as holiday_wage_detail_wage',
        'report_holiday_wage_detail.tax as holiday_wage_detail_tax',
        'report_holiday_wage_detail.total as holiday_wage_detail_total',
        // report_accommodation columns
        'report_accommodation.accommodation_id as accommodation_id',
        'report_accommodation.form_id as accommodation_form_id',
        'report_accommodation.type as accommodation_type',
        'report_accommodation.price_per_day as accommodation_price_per_day',
        'report_accommodation.days as accommodation_days',
        'report_accommodation.total as accommodation_total',
        // report_other_expense columns
        'report_other_expense.expense_id as other_expense_id',
        'report_other_expense.form_id as other_expense_form_id',
        'report_other_expense.name as other_expense_name',
        'report_other_expense.amount as other_expense_amount',
        'report_other_expense.certificate_file_path as other_expense_certificate_file_path',
        // report_transportation columns
        'report_transportation.transport_id as transportation_id',
        'report_transportation.form_id as transportation_form_id',
        'report_transportation.type as transportation_type',
        'report_transportation.from_place as transportation_from_place',
        'report_transportation.to_place as transportation_to_place',
        'report_transportation.date as transportation_date',
        'report_transportation.amount as transportation_amount',
        'report_transportation.receipt_file_path as transportation_receipt_file_path',
        // report_allowance columns
        'report_allowance.allowance_id as allowance_id',
        'report_allowance.form_id as allowance_form_id',
        'report_allowance.type as allowance_type',
        'report_allowance.category as allowance_category',
        'report_allowance.sub_category as allowance_sub_category',
        'report_allowance.days as allowance_days',
        'report_allowance.total as allowance_total',
      );

    // 3. แปลงข้อมูลเป็น camelCase
    const data = await Promise.all(rows.map((row) => toCamelCase<any>(row)));

    // 4. Group ข้อมูลให้ report_traveller_form เป็น array (และ embed traveller, dailyTravelDetails)
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
        // หา form ใน array เดิม
        let form = grouped[id].reportTravellerForm.find(
          (f) => f.formId === row.formId,
        );
        if (!form) {
          form = {
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
              travelerId: row.travellerTravelerId,
            },
            dailyTravelDetails: [],
            holidayWageDetailDaily: [],
            accommodationDetails: [],
            otherExpenseDetails: [],
            transportationDetails: [],
            allowanceCalculations: [],
          };
          grouped[id].reportTravellerForm.push(form);
        }
        // ถ้ามี dailyTravelDetailId ให้ push เข้า array
        if (row.dailyTravelDetailId) {
          if (
            !form.dailyTravelDetails.some(
              (d) => d.detailId === row.dailyTravelDetailId,
            )
          ) {
            form.dailyTravelDetails.push({
              id: row.dailyTravelDetailId,
              detailId: row.dailyTravelDetailId,
              formId: row.dailyTravelDetailFormId,
              departurePlace: row.dailyTravelDetailDeparturePlace,
              departureDate: row.dailyTravelDetailDepartureDate,
              departureTime: row.dailyTravelDetailDepartureTime,
              returnPlace: row.dailyTravelDetailReturnPlace,
              returnDate: row.dailyTravelDetailReturnDate,
              returnTime: row.dailyTravelDetailReturnTime,
              travelDetails: row.dailyTravelDetailTravelDetails,
            });
          }
        }
        // ถ้ามี holidayWageDetailId ให้ push เข้า array
        if (row.holidayWageDetailId) {
          if (
            !form.holidayWageDetailDaily.some(
              (d) => d.holidayId === row.holidayWageDetailId,
            )
          ) {
            form.holidayWageDetailDaily.push({
              id: row.holidayWageDetailId,
              holidayId: row.holidayWageDetailId,
              formId: row.holidayWageDetailFormId,
              date: row.holidayWageDetailDate,
              hours: row.holidayWageDetailHours,
              year: row.holidayWageDetailYear,
              wage: row.holidayWageDetailWage,
              tax: row.holidayWageDetailTax,
              total: row.holidayWageDetailTotal,
            });
          }
        }
        // ถ้ามี accommodationId ให้ push เข้า array
        if (row.accommodationId) {
          if (
            !form.accommodationDetails.some(
              (d) => d.accommodationId === row.accommodationId,
            )
          ) {
            form.accommodationDetails.push({
              id: row.accommodationId,
              accommodationId: row.accommodationId,
              formId: row.accommodationFormId,
              type: row.accommodationType,
              pricePerDay: row.accommodationPricePerDay,
              days: row.accommodationDays,
              total: row.accommodationTotal,
            });
          }
        }
        // ถ้ามี otherExpenseId ให้ push เข้า array
        if (row.otherExpenseId) {
          if (
            !form.otherExpenseDetails.some(
              (d) => d.expenseId === row.otherExpenseId,
            )
          ) {
            form.otherExpenseDetails.push({
              id: row.otherExpenseId,
              expenseId: row.otherExpenseId,
              formId: row.otherExpenseFormId,
              name: row.otherExpenseName,
              amount: row.otherExpenseAmount,
              certificateFilePath: row.otherExpenseCertificateFilePath,
            });
          }
        }
        if (row.transportationId) {
          if (
            !form.transportationDetails.some(
              (d) => d.transportId === row.transportationId,
            )
          ) {
            form.transportationDetails.push({
              id: row.transportationId,
              transportId: row.transportationId,
              formId: row.transportationFormId,
              type: row.transportationType,
              fromPlace: row.transportationFromPlace,
              toPlace: row.transportationToPlace,
              date: row.transportationDate,
              amount: row.transportationAmount,
              receiptFilePath: row.transportationReceiptFilePath,
            });
          }
        }
        if (row.allowanceId) {
          if (
            !form.allowanceCalculations.some(
              (d) => d.allowanceId === row.allowanceId,
            )
          ) {
            form.allowanceCalculations.push({
              id: row.allowanceId,
              allowanceId: row.allowanceId,
              formId: row.allowanceFormId,
              type: row.allowanceType,
              category: row.allowanceCategory,
              subCategory: row.allowanceSubCategory,
              days: row.allowanceDays,
              total: row.allowanceTotal,
            });
          }
        }
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
      .leftJoin(
        'report_daily_travel_detail',
        'report_traveller_form.form_id',
        'report_daily_travel_detail.form_id',
      )
      .leftJoin(
        'report_holiday_wage_detail',
        'report_traveller_form.form_id',
        'report_holiday_wage_detail.form_id',
      )
      .leftJoin(
        'report_accommodation',
        'report_traveller_form.form_id',
        'report_accommodation.form_id',
      )
      .leftJoin(
        'report_other_expense',
        'report_traveller_form.form_id',
        'report_other_expense.form_id',
      )
      .leftJoin(
        'report_transportation',
        'report_traveller_form.form_id',
        'report_transportation.form_id',
      )
      .leftJoin(
        'report_allowance',
        'report_traveller_form.form_id',
        'report_allowance.form_id',
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
        'report_traveller.traveler_id as traveller_traveler_id',
        // report_daily_travel_detail columns
        'report_daily_travel_detail.detail_id as daily_travel_detail_id',
        'report_daily_travel_detail.form_id as daily_travel_detail_form_id',
        'report_daily_travel_detail.departure_place as daily_travel_detail_departure_place',
        'report_daily_travel_detail.departure_date as daily_travel_detail_departure_date',
        'report_daily_travel_detail.departure_time as daily_travel_detail_departure_time',
        'report_daily_travel_detail.return_place as daily_travel_detail_return_place',
        'report_daily_travel_detail.return_date as daily_travel_detail_return_date',
        'report_daily_travel_detail.return_time as daily_travel_detail_return_time',
        'report_daily_travel_detail.travel_details as daily_travel_detail_travel_details',
        // report_holiday_wage_detail columns
        'report_holiday_wage_detail.holiday_id as holiday_wage_detail_id',
        'report_holiday_wage_detail.form_id as holiday_wage_detail_form_id',
        'report_holiday_wage_detail.date as holiday_wage_detail_date',
        'report_holiday_wage_detail.hours as holiday_wage_detail_hours',
        'report_holiday_wage_detail.year as holiday_wage_detail_year',
        'report_holiday_wage_detail.wage as holiday_wage_detail_wage',
        'report_holiday_wage_detail.tax as holiday_wage_detail_tax',
        'report_holiday_wage_detail.total as holiday_wage_detail_total',
        // report_accommodation columns
        'report_accommodation.accommodation_id as accommodation_id',
        'report_accommodation.form_id as accommodation_form_id',
        'report_accommodation.type as accommodation_type',
        'report_accommodation.price_per_day as accommodation_price_per_day',
        'report_accommodation.days as accommodation_days',
        'report_accommodation.total as accommodation_total',
        // report_other_expense columns
        'report_other_expense.expense_id as other_expense_id',
        'report_other_expense.form_id as other_expense_form_id',
        'report_other_expense.name as other_expense_name',
        'report_other_expense.amount as other_expense_amount',
        'report_other_expense.certificate_file_path as other_expense_certificate_file_path',
        // report_transportation columns
        'report_transportation.transport_id as transportation_id',
        'report_transportation.form_id as transportation_form_id',
        'report_transportation.type as transportation_type',
        'report_transportation.from_place as transportation_from_place',
        'report_transportation.to_place as transportation_to_place',
        'report_transportation.date as transportation_date',
        'report_transportation.amount as transportation_amount',
        'report_transportation.receipt_file_path as transportation_receipt_file_path',
        // report_allowance columns
        'report_allowance.allowance_id as allowance_id',
        'report_allowance.form_id as allowance_form_id',
        'report_allowance.type as allowance_type',
        'report_allowance.category as allowance_category',
        'report_allowance.sub_category as allowance_sub_category',
        'report_allowance.days as allowance_days',
        'report_allowance.total as allowance_total',
      )
      .where('report_approve.id', id);

    if (!rows || rows.length === 0)
      throw new NotFoundException('Record not found');

    const data = await Promise.all(rows.map((row) => toCamelCase<any>(row)));
    // Group ข้อมูลให้ report_traveller_form เป็น array (และ embed traveller, dailyTravelDetails)
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
    // Group formId -> form object
    const formMap = new Map();
    for (const r of data) {
      if (r.formId) {
        let form = formMap.get(r.formId);
        if (!form) {
          form = {
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
              travelerId: r.travellerTravelerId,
            },
            dailyTravelDetails: [],
            holidayWageDetailDaily: [],
            accommodationDetails: [],
            otherExpenseDetails: [],
            transportationDetails: [],
            allowanceCalculations: [],
          };
          formMap.set(r.formId, form);
        }
        // push dailyTravelDetail ถ้ามี
        if (r.dailyTravelDetailId) {
          if (
            !form.dailyTravelDetails.some(
              (d) => d.detailId === r.dailyTravelDetailId,
            )
          ) {
            form.dailyTravelDetails.push({
              detailId: r.dailyTravelDetailId,
              formId: r.dailyTravelDetailFormId,
              departurePlace: r.dailyTravelDetailDeparturePlace,
              departureDate: r.dailyTravelDetailDepartureDate,
              departureTime: r.dailyTravelDetailDepartureTime,
              returnPlace: r.dailyTravelDetailReturnPlace,
              returnDate: r.dailyTravelDetailReturnDate,
              returnTime: r.dailyTravelDetailReturnTime,
              travelDetails: r.dailyTravelDetailTravelDetails,
            });
          }
        }
        // push holidayWageDetailDaily ถ้ามี
        if (r.holidayWageDetailId) {
          if (
            !form.holidayWageDetailDaily.some(
              (d) => d.holidayId === r.holidayWageDetailId,
            )
          ) {
            form.holidayWageDetailDaily.push({
              holidayId: r.holidayWageDetailId,
              formId: r.holidayWageDetailFormId,
              date: r.holidayWageDetailDate,
              hours: r.holidayWageDetailHours,
              year: r.holidayWageDetailYear,
              wage: r.holidayWageDetailWage,
              tax: r.holidayWageDetailTax,
              total: r.holidayWageDetailTotal,
            });
          }
        }
        // push accommodationDetails ถ้ามี
        if (r.accommodationId) {
          if (
            !form.accommodationDetails.some(
              (d) => d.accommodationId === r.accommodationId,
            )
          ) {
            form.accommodationDetails.push({
              id: r.accommodationId,
              accommodationId: r.accommodationId,
              formId: r.accommodationFormId,
              type: r.accommodationType,
              pricePerDay: r.accommodationPricePerDay,
              days: r.accommodationDays,
              total: r.accommodationTotal,
            });
          }
        }
        // push otherExpenseDetails ถ้ามี
        if (r.otherExpenseId) {
          if (
            !form.otherExpenseDetails.some(
              (d) => d.expenseId === r.otherExpenseId,
            )
          ) {
            form.otherExpenseDetails.push({
              id: r.otherExpenseId,
              expenseId: r.otherExpenseId,
              formId: r.otherExpenseFormId,
              name: r.otherExpenseName,
              amount: r.otherExpenseAmount,
              certificateFilePath: r.otherExpenseCertificateFilePath,
            });
          }
        }
        // push transportationDetails ถ้ามี
        if (r.transportationId) {
          if (
            !form.transportationDetails.some(
              (d) => d.transportId === r.transportationId,
            )
          ) {
            form.transportationDetails.push({
              id: r.transportationId,
              transportId: r.transportationId,
              formId: r.transportationFormId,
              type: r.transportationType,
              fromPlace: r.transportationFromPlace,
              toPlace: r.transportationToPlace,
              date: r.transportationDate,
              amount: r.transportationAmount,
              receiptFilePath: r.transportationReceiptFilePath,
            });
          }
        }
        // push allowanceCalculations ถ้ามี
        if (r.allowanceId) {
          if (
            !form.allowanceCalculations.some(
              (d) => d.allowanceId === r.allowanceId,
            )
          ) {
            form.allowanceCalculations.push({
              id: r.allowanceId,
              allowanceId: r.allowanceId,
              formId: r.allowanceFormId,
              type: r.allowanceType,
              category: r.allowanceCategory,
              subCategory: r.allowanceSubCategory,
              days: r.allowanceDays,
              total: r.allowanceTotal,
            });
          }
        }
      }
    }
    result.reportTravellerForm = Array.from(formMap.values());
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
