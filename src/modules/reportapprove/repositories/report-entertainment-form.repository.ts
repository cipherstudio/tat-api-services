import { Injectable, NotFoundException } from '@nestjs/common';
import { KnexBaseRepository } from 'src/common/repositories/knex-base.repository';
import { ReportEntertainmentForm } from '../entities/report-entertainment-form.entity';
import { KnexService } from 'src/database/knex-service/knex.service';
import { toSnakeCase, toCamelCase } from 'src/common/utils/case-mapping';
import { CreateEntertainmentFormDto } from '../dto/create-entertainment-form.dto';
import { UpdateEntertainmentFormDto } from '../dto/update-entertainment-form.dto';
import { EntertainmentFormQueryDto } from '../dto/entertainment-form-query.dto';

@Injectable()
export class ReportEntertainmentFormRepository extends KnexBaseRepository<ReportEntertainmentForm> {
  constructor(protected readonly knexService: KnexService) {
    super(knexService, 'report_entertainment_form');
  }

  private convertToDateWithoutTimezone(eventDate: any): Date {
    if (eventDate instanceof Date) {
      // Create new Date with local date components to remove timezone
      const year = eventDate.getFullYear();
      const month = eventDate.getMonth();
      const day = eventDate.getDate();
      return new Date(year, month, day);
    } else if (typeof eventDate === 'string') {
      // Parse string date and create Date without timezone
      const dateParts = eventDate.split('-');
      const year = parseInt(dateParts[0]);
      const month = parseInt(dateParts[1]) - 1; // month is 0-based
      const day = parseInt(dateParts[2]);
      return new Date(year, month, day);
    } else {
      return new Date();
    }
  }

  async findWithPaginationAndSearch(query: EntertainmentFormQueryDto, employeeCode?: string) {
    const {
      page = 1,
      limit = 10,
      employeeId,
      employeeName,
      employeePosition,
      department,
      job,
      employeeType,
      entertainmentType,
      totalAmount,
      minAmount,
      maxAmount,
      statusId,
      orderBy = 'created_at',
      direction = 'desc',
      startDate,
      endDate,
      searchTerm,
    } = query;

    const offset = (page - 1) * limit;

    // Build base query
    let baseQuery = this.knex('report_entertainment_form as ref')
      .leftJoin('entertainment_form_status as efs', 'ref.status_id', 'efs.id')
      .leftJoin('report_entertainment_items as rei', 'ref.id', 'rei.report_id');

    // Apply filters
    if (employeeId) {
      baseQuery = baseQuery.where('ref.employee_id', 'like', `%${employeeId}%`);
    }

    if (employeeName) {
      baseQuery = baseQuery.where(
        'ref.employee_name',
        'like',
        `%${employeeName}%`,
      );
    }

    if (employeePosition) {
      baseQuery = baseQuery.where(
        'ref.employee_position',
        'like',
        `%${employeePosition}%`,
      );
    }

    if (department) {
      baseQuery = baseQuery.where('ref.department', 'like', `%${department}%`);
    }

    if (job) {
      baseQuery = baseQuery.where('ref.job', 'like', `%${job}%`);
    }

    if (employeeType) {
      baseQuery = baseQuery.where('ref.employee_type', 'like', `%${employeeType}%`);
    }

    if (entertainmentType) {
      baseQuery = baseQuery.where('ref.entertainment_type', 'like', `%${entertainmentType}%`);
    }

    if (totalAmount !== undefined) {
      baseQuery = baseQuery.where('ref.total_amount', totalAmount);
    }

    if (minAmount !== undefined) {
      baseQuery = baseQuery.where('ref.total_amount', '>=', minAmount);
    }

    if (maxAmount !== undefined) {
      baseQuery = baseQuery.where('ref.total_amount', '<=', maxAmount);
    }

    if (statusId) {
      baseQuery = baseQuery.where('ref.status_id', statusId);
    }

    // user can see only their own entertainment forms (unless they are admin/supervisor)
    if (employeeCode) {
      baseQuery = baseQuery.where('ref.created_by', employeeCode);
    }

    if (startDate) {
      baseQuery = baseQuery.where(
        'ref.created_at',
        '>=',
        this.knex.raw(`TO_DATE('${startDate}', 'YYYY-MM-DD')`),
      );
    }

    if (endDate) {
      baseQuery = baseQuery.where(
        'ref.created_at',
        '<=',
        this.knex.raw(`TO_DATE('${endDate} 23:59:59', 'YYYY-MM-DD HH24:MI:SS')`),
      );
    }

    if (searchTerm) {
      baseQuery = baseQuery.where(
        'ref.employee_name',
        'like',
        `%${searchTerm}%`,
      );
      baseQuery = baseQuery.orWhere(
        'ref.employee_id',
        'like',
        `%${searchTerm}%`,
      );
      baseQuery = baseQuery.orWhere(
        'ref.department',
        'like',
        `%${searchTerm}%`,
      );
      baseQuery = baseQuery.orWhere('ref.job', 'like', `%${searchTerm}%`);
      baseQuery = baseQuery.orWhere('ref.employee_type', 'like', `%${searchTerm}%`);
      baseQuery = baseQuery.orWhere('ref.entertainment_type', 'like', `%${searchTerm}%`);
      baseQuery = baseQuery.orWhere('ref.employee_position', 'like', `%${searchTerm}%`);
      // Note: section column might not exist in Oracle database
      // Uncomment the following line if the section column exists
      baseQuery = baseQuery.orWhere('ref.section', 'like', `%${searchTerm}%`);
    }
    // Get total count
    const countResult = await baseQuery
      .clone()
      .count('ref.id as count')
      .first();
    const total = Number(countResult?.count || 0);

    // Get paginated data
    const data = await baseQuery
      .select(
        'ref.id',
        'ref.employee_id',
        'ref.employee_name',
        'ref.employee_position',
        'ref.department',
        'ref.section',
        'ref.job',
        'ref.employee_type',
        'ref.entertainment_type',
        'ref.status_id',
        'ref.total_amount',
        'ref.approved_by',
        'ref.approved_at',
        'ref.approved_comment',
        'ref.created_by',
        'ref.created_at',
        'ref.updated_by',
        'ref.updated_at',
        'efs.name as status_name',
        'efs.description as status_description',
        //report_entertainment_items
        'rei.id as item_id',
        'rei.description as item_description',
        'rei.people_count',
        'rei.venue as item_venue',
        'rei.event_date',
        'rei.purpose',
        'rei.receipt_number',
        'rei.receipt_book',
        'rei.amount',
        'rei.amount_text',
        'rei.display_order',
      )
      .orderBy(`ref.${orderBy}`, direction)
      .limit(limit)
      .offset(offset);

    // Group data by report ID and transform
    const groupedData = new Map();

    for (const row of data) {
      const reportId = row.id;

      if (!groupedData.has(reportId)) {
        // Create main report object
        const mainReport: any = await toCamelCase({
          id: row.id,
          employee_id: row.employee_id,
          employee_name: row.employee_name,
          employee_position: row.employee_position,
          department: row.department,
          section: row.section,
          job: row.job,
          employee_type: row.employee_type,
          entertainment_type: row.entertainment_type,
          status_id: row.status_id,
          total_amount: row.total_amount,
          approved_by: row.approved_by,
          approved_at: row.approved_at,
          approved_comment: row.approved_comment,
          created_by: row.created_by,
          created_at: row.created_at,
          updated_by: row.updated_by,
          updated_at: row.updated_at,
          status_name: row.status_name,
          status_description: row.status_description,
        });

        mainReport.items = [];
        groupedData.set(reportId, mainReport);
      }

      // Add item if exists
      if (row.item_id) {
        const item = await toCamelCase({
          id: row.item_id,
          description: row.item_description,
          people_count: row.people_count,
          venue: row.item_venue,
          event_date: row.event_date,
          purpose: row.purpose,
          receipt_number: row.receipt_number,
          receipt_book: row.receipt_book,
          amount: row.amount,
          amount_text: row.amount_text,
          display_order: row.display_order,
        });

        groupedData.get(reportId).items.push(item);
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
    let baseQuery = this.knex('report_entertainment_form as ref')
      .leftJoin('entertainment_form_status as efs', 'ref.status_id', 'efs.id')
      .leftJoin('report_entertainment_items as rei', 'ref.id', 'rei.report_id')
      .where('ref.id', id);

    // Security check: user can only view their own entertainment forms
    if (employeeCode) {
      baseQuery = baseQuery.where('ref.created_by', employeeCode);
    }

    const form = await baseQuery
      .select(
        'ref.id',
        'ref.employee_id',
        'ref.employee_name',
        'ref.employee_position',
        'ref.department',
        'ref.section',
        'ref.job',
        'ref.employee_type',
        'ref.entertainment_type',
        'ref.status_id',
        'ref.total_amount',
        'ref.approved_by',
        'ref.approved_at',
        'ref.approved_comment',
        'ref.created_by',
        'ref.created_at',
        'ref.updated_by',
        'ref.updated_at',
        'efs.name as status_name',
        'efs.description as status_description',
        'rei.id as item_id',
        'rei.description as item_description',
        'rei.people_count',
        'rei.venue as item_venue',
        'rei.event_date',
        'rei.purpose',
        'rei.receipt_number',
        'rei.receipt_book',
        'rei.amount',
        'rei.amount_text',
        'rei.display_order',
      )
      .orderBy('rei.display_order', 'asc');

    if (!form.length) {
      throw new NotFoundException(`Entertainment form with ID ${id} not found`);
    }

    // Group data by report ID and transform (same logic as findWithPaginationAndSearch)
    const groupedData = new Map();

    for (const row of form) {
      const reportId = row.id;

      if (!groupedData.has(reportId)) {
        // Create main report object
        const mainReport: any = await toCamelCase({
          id: row.id,
          employee_id: row.employee_id,
          employee_name: row.employee_name,
          employee_position: row.employee_position,
          department: row.department,
          section: row.section,
          job: row.job,
          employee_type: row.employee_type,
          entertainment_type: row.entertainment_type,
          status_id: row.status_id,
          total_amount: row.total_amount,
          approved_by: row.approved_by,
          approved_at: row.approved_at,
          approved_comment: row.approved_comment,
          created_by: row.created_by,
          created_at: row.created_at,
          updated_by: row.updated_by,
          updated_at: row.updated_at,
          status_name: row.status_name,
          status_description: row.status_description,
        });

        mainReport.items = [];
        groupedData.set(reportId, mainReport);
      }

      // Add item if exists
      if (row.item_id) {
        const item = await toCamelCase({
          id: row.item_id,
          description: row.item_description,
          people_count: row.people_count,
          venue: row.item_venue,
          event_date: row.event_date,
          purpose: row.purpose,
          receipt_number: row.receipt_number,
          receipt_book: row.receipt_book,
          amount: row.amount,
          amount_text: row.amount_text,
          display_order: row.display_order,
        });

        groupedData.get(reportId).items.push(item);
      }
    }

    // Return the first (and only) record
    const result = Array.from(groupedData.values())[0];

    return result;
  }

  async create(dto: CreateEntertainmentFormDto) {
    const { items, ...formData } = dto;
    const dbFormData = await toSnakeCase(formData);

    // Insert main form
    const row = await this.knex('report_entertainment_form')
      .insert({
        ...dbFormData,
        status_id: dbFormData.status_id || 1, // Default to draft
        total_amount: dbFormData.total_amount || 0,
      })
      .returning('id');
    const formId = row[0].id;
    if (items && items.length > 0) {
      for (const item of items) {
        const dbItem = await toSnakeCase(item);
        await this.knex('report_entertainment_items').insert({
          ...dbItem,
          report_id: formId,
          event_date: this.convertToDateWithoutTimezone(item.eventDate),
        });
      }
    }

    return this.findById(formId);
  }

  async update(id: number, dto: UpdateEntertainmentFormDto) {
    const { items, ...formData } = dto;
    const dbFormData = await toSnakeCase(formData);

    // Update main form
    await this.knex('report_entertainment_form')
      .where('id', id)
      .update({
        ...dbFormData,
        updated_at: this.knex.fn.now(),
      });

    // Update items if provided
    if (items && items.length > 0) {
      // Delete existing items
      await this.knex('report_entertainment_items')
        .where('report_id', id)
        .del();

      // Insert new items
      const dbItems = await Promise.all(
        items.map(async (item) => {
          const dbItem = await toSnakeCase(item);

          return {
            ...dbItem,
            report_id: id,
            event_date: this.convertToDateWithoutTimezone(item.eventDate),
          };
        }),
      );

      await this.knex('report_entertainment_items').insert(dbItems);
    }

    return this.findById(id);
  }

  async updateStatus(
    id: number,
    statusId: number,
    approvedBy?: string,
    approvedComment?: string,
  ) {
    const updateData: any = {
      status_id: statusId,
      updated_at: this.knex.fn.now(),
    };

    if (statusId === 3) {
      // Approved
      updateData.approved_by = approvedBy;
      updateData.approved_at = this.knex.fn.now();
      updateData.approved_comment = approvedComment;
    }

    await this.knex('report_entertainment_form')
      .where('id', id)
      .update(updateData);

    return this.findById(id);
  }

  async calculateTotalAmount(id: number) {
    const result = await this.knex('report_entertainment_items')
      .where('report_id', id)
      .sum('amount as total')
      .first();

    const totalAmount = Number(result?.total || 0);

    await this.knex('report_entertainment_form').where('id', id).update({
      total_amount: totalAmount,
      updated_at: this.knex.fn.now(),
    });

    return totalAmount;
  }
}
