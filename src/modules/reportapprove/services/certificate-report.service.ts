import { Injectable, NotFoundException } from '@nestjs/common';
import { ReportCertificateRepository } from '../repositories/report-certificate.repository';
import { ReportCertificateExpenseRepository } from '../repositories/report-certificate-expense.repository';
import {
  CreateCertificateReportDto,
  CreateCertificateExpenseDto,
  CreateCertificateExchangeRateDto,
} from '../dto/create-certificate-report.dto';
import { UpdateCertificateReportDto } from '../dto/update-certificate-report.dto';
import { CertificateReportQueryDto } from '../dto/certificate-report-query.dto';
import { ReportCertificate } from '../entities/report-certificate.entity';
import { ReportCertificateExpense } from '../entities/report-certificate-expense.entity';

@Injectable()
export class CertificateReportService {
  constructor(
    private readonly certificateRepository: ReportCertificateRepository,
    private readonly expenseRepository: ReportCertificateExpenseRepository,
  ) {}

  private mapExpenseInsertRow(
    expense: CreateCertificateExpenseDto,
    reportId: number,
    index: number,
  ): Record<string, unknown> {
    return {
      report_certificate_id: reportId,
      detail: expense.detail,
      expense_date: new Date(expense.expense_date),
      amount: expense.amount,
      display_order: expense.display_order ?? index + 1,
      local_amount: expense.local_amount ?? null,
      currency_label: expense.currency_label ?? null,
      currency_code_en: expense.currency_code_en ?? null,
      exchange_rate: expense.exchange_rate ?? null,
    };
  }

  private async replaceExchangeRates(
    reportId: number,
    rows: CreateCertificateExchangeRateDto[] | undefined,
  ): Promise<void> {
    const knex = this.certificateRepository.knex;
    await knex('report_certificate_exchange_rates')
      .where('report_certificate_id', reportId)
      .delete();
    if (!rows?.length) return;
    const now = new Date();
    await knex('report_certificate_exchange_rates').insert(
      rows.map((r, i) => ({
        report_certificate_id: reportId,
        country: r.country ?? null,
        currency_label: r.currency_label ?? null,
        currency_code_en: r.currency_code_en ?? null,
        exchange_rate: r.exchange_rate ?? null,
        display_order: r.display_order ?? i + 1,
        created_at: now,
        updated_at: now,
      })),
    );
  }

  async findAll(query: CertificateReportQueryDto, employeeCode?: string): Promise<any> {
    let queryBuilder = this.certificateRepository.knex('report_certificate')
      .whereNull('deleted_at');

    // Filter by created_by if provided
    if (employeeCode) {
      queryBuilder = queryBuilder.where('created_by', employeeCode);
    }



    // Apply filters
    if (query.employee_type) {
      queryBuilder = queryBuilder.where('employee_type', 'like', `%${query.employee_type}%`);
    }

    if (query.employee_code) {
      queryBuilder = queryBuilder.where('employee_code', 'like', `%${query.employee_code}%`);
    }

    if (query.employee_name) {
      queryBuilder = queryBuilder.where('employee_name', 'like', `%${query.employee_name}%`);
    }

    if (query.employee_position) {
      queryBuilder = queryBuilder.where('employee_position', 'like', `%${query.employee_position}%`);
    }

    if (query.department) {
      queryBuilder = queryBuilder.where('department', 'like', `%${query.department}%`);
    }

    if (query.min_amount !== undefined) {
      queryBuilder = queryBuilder.where('total_amount', '>=', query.min_amount);
    }

    if (query.max_amount !== undefined) {
      queryBuilder = queryBuilder.where('total_amount', '<=', query.max_amount);
    }

    if (query.created_at_from) {
      // Convert string to Date object for Oracle
      const fromDate = new Date(query.created_at_from);
      fromDate.setHours(0, 0, 0, 0); // Set to start of day
      queryBuilder = queryBuilder.where('created_at', '>=', fromDate);
    }

    if (query.created_at_to) {
      // Convert string to Date object for Oracle
      const toDate = new Date(query.created_at_to);
      toDate.setHours(23, 59, 59, 999); // Set to end of day
      queryBuilder = queryBuilder.where('created_at', '<=', toDate);
    }

    // Time filters
    if (query.time_out_from) {
      queryBuilder = queryBuilder.where('time_out', '>=', query.time_out_from);
    }

    if (query.time_out_to) {
      queryBuilder = queryBuilder.where('time_out', '<=', query.time_out_to);
    }

    if (query.time_in_from) {
      queryBuilder = queryBuilder.where('time_in', '>=', query.time_in_from);
    }

    if (query.time_in_to) {
      queryBuilder = queryBuilder.where('time_in', '<=', query.time_in_to);
    }

    // Payment order filters
    if (query.is_payment_order_number_1 !== undefined) {
      queryBuilder = queryBuilder.where('is_payment_order_number_1', query.is_payment_order_number_1);
    }

    if (query.is_payment_order_number_2 !== undefined) {
      queryBuilder = queryBuilder.where('is_payment_order_number_2', query.is_payment_order_number_2);
    }

    if (query.is_payment_without_receipt !== undefined) {
      queryBuilder = queryBuilder.where('is_payment_without_receipt', query.is_payment_without_receipt);
    }

    if (query.is_payment_nonstandard_receipt !== undefined) {
      queryBuilder = queryBuilder.where('is_payment_nonstandard_receipt', query.is_payment_nonstandard_receipt);
    }

    if (query.is_payment_with_lost_receipt !== undefined) {
      queryBuilder = queryBuilder.where('is_payment_with_lost_receipt', query.is_payment_with_lost_receipt);
    }

    if (query.is_payment_with_lost_document !== undefined) {
      queryBuilder = queryBuilder.where('is_payment_with_lost_document', query.is_payment_with_lost_document);
    }

    // Apply expense_details_search filter
    if (query.expense_details_search) {
      // We need to filter by expenses after getting the results
      // This will be handled in the post-processing step
    }

    // Get total count
    const totalCount = await queryBuilder.clone().count('* as count').first();

    // Apply pagination
    if (query.page && query.limit) {
      const offset = (query.page - 1) * query.limit;
      queryBuilder = queryBuilder.offset(offset).limit(query.limit);
    }

    // Apply sorting
    const sortBy = query.sortBy || 'created_at';
    const sortOrder = query.sortOrder || 'desc';
    queryBuilder = queryBuilder.orderBy(sortBy, sortOrder);

    const results = await queryBuilder;

    const ids = results.map((r) => r.id);
    const expensesByReport = new Map<number, ReportCertificateExpense[]>();
    const ratesByReport = new Map<number, Record<string, unknown>[]>();
    if (ids.length > 0) {
      const allExpenses = await this.expenseRepository
        .knex('report_certificate_expenses')
        .whereIn('report_certificate_id', ids)
        .orderBy('display_order', 'asc')
        .orderBy('id', 'asc');
      const allRates = await this.certificateRepository
        .knex('report_certificate_exchange_rates')
        .whereIn('report_certificate_id', ids)
        .orderBy('display_order', 'asc')
        .orderBy('id', 'asc');
      for (const e of allExpenses) {
        const rid = e.report_certificate_id as number;
        if (!expensesByReport.has(rid)) expensesByReport.set(rid, []);
        expensesByReport.get(rid)!.push(e as ReportCertificateExpense);
      }
      for (const r of allRates) {
        const rid = r.report_certificate_id as number;
        if (!ratesByReport.has(rid)) ratesByReport.set(rid, []);
        ratesByReport.get(rid)!.push(r);
      }
    }

    let resultsWithExpenseDetails = results.map((certificate) => {
      const expenses = expensesByReport.get(certificate.id) ?? [];
      const exchange_rates = ratesByReport.get(certificate.id) ?? [];
      const expenseDetails = expenses
        .map(
          (expense) =>
            `${expense.detail}(${Number(expense.amount).toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })})`,
        )
        .join(', ');
      return {
        ...certificate,
        expenses,
        exchange_rates,
        expense_details: expenseDetails || null,
      };
    });

    // Apply expense_details_search filter if provided
    if (query.expense_details_search) {
      resultsWithExpenseDetails = resultsWithExpenseDetails.filter(certificate => {
        if (!certificate.expense_details) return false;
        return certificate.expense_details.toLowerCase().includes(query.expense_details_search.toLowerCase());
      });
    }

    // Apply pagination after filtering
    let paginatedResults = resultsWithExpenseDetails;
    if (query.page && query.limit) {
      const offset = (query.page - 1) * query.limit;
      paginatedResults = resultsWithExpenseDetails.slice(offset, offset + query.limit);
    }

    return {
      data: paginatedResults,
      pagination: {
        page: query.page || 1,
        limit: query.limit || 10,
        total: resultsWithExpenseDetails.length,
        totalPages: Math.ceil(resultsWithExpenseDetails.length / (query.limit || 10)),
      },
    };
  }

  async findOne(id: number, employeeCode?: string): Promise<any> {
    const certificate = await this.certificateRepository.findWithExpenses(id);

    if (!certificate) {
      throw new NotFoundException('Certificate report not found');
    }

    // Check if user can access this report
    if (employeeCode && certificate.created_by !== employeeCode) {
      throw new NotFoundException('Certificate report not found');
    }

    return certificate;
  }

  async create(dto: CreateCertificateReportDto, createdBy: string): Promise<any> {
    const { expenses, exchange_rates, ...certificateRest } = dto;

    const [certificateId] = await this.certificateRepository
      .knex('report_certificate')
      .insert({
        ...certificateRest,
        has_exchange_rate: dto.has_exchange_rate ?? false,
        created_by: createdBy,
        updated_by: createdBy,
      })
      .returning('id');

    const ins = certificateId as { id?: number } | number;
    const newId =
      typeof ins === 'object' && ins !== null && 'id' in ins
        ? (ins as { id: number }).id
        : Number(ins);
    const certificate = await this.certificateRepository.findOne({ id: newId });
    if (!certificate) {
      throw new NotFoundException('Certificate report not found');
    }

    if (expenses?.length) {
      const expenseData = expenses.map((e, i) =>
        this.mapExpenseInsertRow(e, certificate.id, i),
      );
      await this.expenseRepository
        .knex('report_certificate_expenses')
        .insert(expenseData);
    }

    if (exchange_rates !== undefined) {
      await this.replaceExchangeRates(certificate.id, exchange_rates);
    }

    return this.certificateRepository.findWithExpenses(certificate.id);
  }

  async update(id: number, dto: UpdateCertificateReportDto, updatedBy: string, employeeCode?: string): Promise<ReportCertificate> {
    // Check if certificate exists and user can access it
    const existingCertificate = await this.certificateRepository.findOne({ id });
    if (!existingCertificate) {
      throw new NotFoundException('Certificate report not found');
    }

    if (employeeCode && existingCertificate.created_by !== employeeCode) {
      throw new NotFoundException('Certificate report not found');
    }

    const { expenses, exchange_rates, ...certificateData } = dto;

    const cleanUpdate = Object.fromEntries(
      Object.entries(certificateData).filter(([, v]) => v !== undefined),
    ) as Record<string, unknown>;

    const hasChildUpdates =
      expenses !== undefined || exchange_rates !== undefined;

    if (Object.keys(cleanUpdate).length > 0 || hasChildUpdates) {
      await this.certificateRepository
        .knex('report_certificate')
        .where('id', id)
        .update({
          ...cleanUpdate,
          updated_by: updatedBy,
          updated_at: new Date(),
        });
    }

    if (expenses !== undefined) {
      await this.expenseRepository.deleteByReportId(id);
      if (expenses.length > 0) {
        const expenseData = expenses.map((e, i) =>
          this.mapExpenseInsertRow(e, id, i),
        );
        await this.expenseRepository
          .knex('report_certificate_expenses')
          .insert(expenseData);
      }
    }

    if (exchange_rates !== undefined) {
      await this.replaceExchangeRates(id, exchange_rates);
    }

    return this.certificateRepository.findWithExpenses(id);
  }

  async delete(id: number, employeeCode?: string): Promise<void> {
    // Check if certificate exists and user can access it
    const existingCertificate = await this.certificateRepository.findOne({ id });
    if (!existingCertificate) {
      throw new NotFoundException('Certificate report not found');
    }

    if (employeeCode && existingCertificate.created_by !== employeeCode) {
      throw new NotFoundException('Certificate report not found');
    }

    await this.certificateRepository
      .knex('report_certificate_exchange_rates')
      .where('report_certificate_id', id)
      .delete();

    await this.certificateRepository.knex('report_certificate')
      .where('id', id)
      .update({
        deleted_at: new Date(),
        updated_at: new Date(),
      });
  }

  async getExpensesByReportId(id: number, employeeCode?: string): Promise<ReportCertificateExpense[]> {
    const certificate = await this.certificateRepository.findOne({ id });
    if (!certificate) {
      throw new NotFoundException('Certificate report not found');
    }

    // Check if user can access this report
    if (employeeCode && certificate.created_by !== employeeCode) {
      throw new NotFoundException('Certificate report not found');
    }

    return this.expenseRepository.findByReportId(id);
  }
}
