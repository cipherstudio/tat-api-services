import { Injectable } from '@nestjs/common';
import { KnexService } from '../../../database/knex-service/knex.service';
import { KnexBaseRepository } from '../../../common/repositories/knex-base.repository';
import { MeetingExpenseReport } from '../entities/meeting-expense-report.entity';
import { MeetingExpenseReportQueryDto } from '../dto/meeting-expense-report-query.dto';

@Injectable()
export class MeetingExpenseReportRepository extends KnexBaseRepository<MeetingExpenseReport> {
  constructor(knexService: KnexService) {
    super(knexService, 'meeting_expense_reports');
  }

  async findWithPaginationAndSearch(query: MeetingExpenseReportQueryDto, employeeCode?: string) {
    const {
      page = 1,
      limit = 10,
      employeeId,
      name,
      department,
      section,
      job,
      meetingType,
      topic,
      chairman,
      totalAmount,
      status,
      orderBy = 'created_at',
      direction = 'desc',
      startDate,
      endDate,
      searchTerm,
    } = query;

    const offset = (page - 1) * limit;

    // Build base query
    let baseQuery = this.knex('meeting_expense_reports as mer')
      .whereNull('mer.deleted_at') // เพิ่ม soft delete filter
      .leftJoin('meet_rate as mr', 'mer.meeting_type', 'mr.id')
      .leftJoin(
        'meeting_expense_report_food_rows as mfr',
        'mer.id',
        'mfr.meeting_expense_report_id',
      )
      .leftJoin(
        'meeting_expense_report_snack_rows as msr',
        'mer.id',
        'msr.meeting_expense_report_id',
      );

    // Security check: user can only view their own reports
    if (employeeCode) {
      baseQuery = baseQuery.where('mer.created_by', employeeCode);
    }

    // Apply filters
    if (employeeId) {
      baseQuery = baseQuery.where('mer.employee_id', 'like', `%${employeeId}%`);
    }
    if (name) {
      baseQuery = baseQuery.where('mer.name', 'like', `%${name}%`);
    }
    if (department) {
      baseQuery = baseQuery.where('mer.department', 'like', `%${department}%`);
    }
    if (section) {
      baseQuery = baseQuery.where('mer.section', 'like', `%${section}%`);
    }
    if (job) {
      baseQuery = baseQuery.where('mer.job', 'like', `%${job}%`);
    }
    if (meetingType) {
      baseQuery = baseQuery.where(
        'mr.type',
        'like',
        `%${meetingType}%`,
      );
    }
    if (topic) {
      baseQuery = baseQuery.where(
        'mer.topic',
        'like',
        `%${topic}%`,
      );
    }
    if (chairman) {
      baseQuery = baseQuery.where(
        'mer.chairman',
        'like',
        `%${chairman}%`,
      );
    }
    if (totalAmount) {
      baseQuery = baseQuery.where('mer.total_amount', totalAmount);
    }
    if (status) {
      baseQuery = baseQuery.where('mer.status', status);
    }
    if (query.pdfHeaderNumber) {
      baseQuery = baseQuery.where('mer.pdf_header_number', 'like', `%${query.pdfHeaderNumber}%`);
    }
    if (query.pdfHeaderYear) {
      baseQuery = baseQuery.where('mer.pdf_header_year', 'like', `%${query.pdfHeaderYear}%`);
    }
    if (startDate) {
      baseQuery = baseQuery.where(
        'mer.meeting_date',
        '>=',
        this.knex.raw(`TO_DATE('${startDate}', 'YYYY-MM-DD')`),
      );
    }
    if (endDate) {
      baseQuery = baseQuery.where(
        'mer.meeting_date',
        '<',
        this.knex.raw(`TO_DATE('${endDate}', 'YYYY-MM-DD') + INTERVAL '1' DAY`),
      );
    }
    if (searchTerm) {
      baseQuery = baseQuery.where(function () {
        this.where('mer.name', 'like', `%${searchTerm}%`)
          .orWhere('mer.employee_id', 'like', `%${searchTerm}%`)
          .orWhere('mer.department', 'like', `%${searchTerm}%`)
          .orWhere('mer.section', 'like', `%${searchTerm}%`)
          .orWhere('mer.job', 'like', `%${searchTerm}%`)
          .orWhere('mer.topic', 'like', `%${searchTerm}%`)
          .orWhere('mer.place', 'like', `%${searchTerm}%`)
          .orWhere('mr.type', 'like', `%${searchTerm}%`)
          .orWhere('mer.pdf_header_number', 'like', `%${searchTerm}%`)
          .orWhere('mer.pdf_header_year', 'like', `%${searchTerm}%`);
      });
    }

    // Get total count
    const countResult = await baseQuery
      .clone()
      .count('mer.id as count')
      .first();
    const total = Number(countResult?.count || 0);

    // Get paginated data
    const data = await baseQuery
      .select(
        'mer.id',
        'mer.department',
        'mer.section',
        'mer.job',
        'mer.employee_id',
        'mer.name',
        'mer.position',
        'mer.topic',
        'mer.place',
        'mer.meeting_type',
        'mr.type as meeting_type_name',
        'mer.chairman',
        'mer.attendees',
        'mer.meeting_date',
        'mer.total_amount',
        'mer.status',
        'mer.status_description',
        'mer.created_by',
        'mer.created_at',
        'mer.updated_at',
        'mer.deleted_at',
        'mer.pdf_header_number',
        'mer.pdf_header_year',
        // Food rows
        'mfr.id as food_id',
        'mfr.meal_type as food_meal_type',
        'mfr.meal_name as food_meal_name',
        'mfr.checked as food_checked',
        'mfr.rate as food_rate',
        'mfr.amount as food_amount',
        'mfr.receipt as food_receipt',
        'mfr.receipt_date as food_receipt_date',
        // Snack rows
        'msr.id as snack_id',
        'msr.snack_type as snack_type',
        'msr.snack_name as snack_name',
        'msr.checked as snack_checked',
        'msr.rate as snack_rate',
        'msr.amount as snack_amount',
        'msr.receipt as snack_receipt',
        'msr.receipt_date as snack_receipt_date',
      )
      .orderBy(`mer.${orderBy}`, direction)
      .limit(limit)
      .offset(offset);

    // Group data by report ID and transform
    const groupedData = new Map();

    for (const row of data) {
      const reportId = row.id;

      if (!groupedData.has(reportId)) {
        // Create main report object
        const mainReport: any = {
          id: row.id,
          department: row.department,
          section: row.section,
          job: row.job,
          employeeId: row.employee_id,
          name: row.name,
          position: row.position,
          topic: row.topic,
          place: row.place,
          meetingType: row.meeting_type,
          meetingTypeName: row.meeting_type_name,
          chairman: row.chairman,
          attendees: row.attendees,
          meetingDate: row.meeting_date,
          totalAmount: row.total_amount,
          status: row.status,
          statusDescription: row.status_description,
          createdBy: row.created_by,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          deletedAt: row.deleted_at,
          pdfHeaderNumber: row.pdf_header_number,
          pdfHeaderYear: row.pdf_header_year,
        };

        mainReport.foodRows = [];
        mainReport.snackRows = [];
        groupedData.set(reportId, mainReport);
      }

      // Add food row if exists
      if (row.food_id) {
        const foodRow = {
          id: row.food_id,
          mealType: row.food_meal_type,
          mealName: row.food_meal_name,
          checked: row.food_checked,
          rate: row.food_rate,
          amount: row.food_amount,
          receipt: row.food_receipt,
          receiptDate: row.food_receipt_date,
        };
        groupedData.get(reportId).foodRows.push(foodRow);
      }

      // Add snack row if exists
      if (row.snack_id) {
        const snackRow = {
          id: row.snack_id,
          snackType: row.snack_type,
          snackName: row.snack_name,
          checked: row.snack_checked,
          rate: row.snack_rate,
          amount: row.snack_amount,
          receipt: row.snack_receipt,
          receiptDate: row.snack_receipt_date,
        };
        groupedData.get(reportId).snackRows.push(snackRow);
      }
    }

    const transformedData = Array.from(groupedData.values());

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

  async findByIdWithDetails(id: number, employeeCode?: string) {
    let baseQuery = this.knex
      .select(
        'meeting_expense_reports.*',
        'meet_rate.type as meeting_type_name'
      )
      .from('meeting_expense_reports')
      .leftJoin('meet_rate', 'meeting_expense_reports.meeting_type', 'meet_rate.id')
      .where('meeting_expense_reports.id', id)
      .whereNull('meeting_expense_reports.deleted_at');

    // Security check: user can only view their own reports
    if (employeeCode) {
      baseQuery = baseQuery.where('meeting_expense_reports.created_by', employeeCode);
    }

    const report = await baseQuery.first();

    if (!report) {
      return null;
    }

    const foodRows = await this.knex
      .select('*')
      .from('meeting_expense_report_food_rows')
      .where('meeting_expense_report_id', id);

    const snackRows = await this.knex
      .select('*')
      .from('meeting_expense_report_snack_rows')
      .where('meeting_expense_report_id', id);

    return {
      ...report,
      foodRows,
      snackRows,
    };
  }

  async updateStatus(
    id: number,
    status: string,
    statusDescription?: string,
    updatedBy?: string,
  ) {
    return this.knex('meeting_expense_reports')
      .where('id', id)
      .update({
        status,
        status_description: statusDescription,
        updated_at: this.knex.fn.now(),
        ...(updatedBy && { updated_by: updatedBy }),
      });
  }
}
