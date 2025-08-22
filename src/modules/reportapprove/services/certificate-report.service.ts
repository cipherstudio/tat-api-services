import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ReportCertificateRepository } from '../repositories/report-certificate.repository';
import { ReportCertificateExpenseRepository } from '../repositories/report-certificate-expense.repository';
import { CreateCertificateReportDto, CreateCertificateExpenseDto } from '../dto/create-certificate-report.dto';
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

    // Add expense_details for each certificate
    let resultsWithExpenseDetails = await Promise.all(
      results.map(async (certificate) => {
        const expenses = await this.expenseRepository.findByReportId(certificate.id);
        
        // Format expense_details
        const expenseDetails = expenses
          .map(expense => `${expense.detail}(${expense.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`)
          .join(', ');
        
        return {
          ...certificate,
          expense_details: expenseDetails || null
        };
      })
    );

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

  async create(dto: CreateCertificateReportDto, createdBy: string): Promise<ReportCertificate> {
    const { expenses, ...certificateData } = dto;

    // Create certificate
    const [certificate] = await this.certificateRepository.knex('report_certificate')
      .insert({
        ...certificateData,
        created_by: createdBy,
        updated_by: createdBy,
      })
      .returning('*');

    // Create expenses if provided
    if (expenses && expenses.length > 0) {
      const expenseData = expenses.map((expense, index) => ({
        ...expense,
        report_certificate_id: certificate.id,
        display_order: expense.display_order || index + 1,
        expense_date: new Date(expense.expense_date),
      }));

      await this.expenseRepository.knex('report_certificate_expenses')
        .insert(expenseData);
    }

    return certificate;
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

    const { expenses, ...certificateData } = dto;

    // Update certificate
    const [updatedCertificate] = await this.certificateRepository.knex('report_certificate')
      .where('id', id)
      .update({
        ...certificateData,
        updated_by: updatedBy,
        updated_at: new Date(),
      })
      .returning('*');

    // Update expenses if provided
    if (expenses !== undefined) {
      // Delete existing expenses
      await this.expenseRepository.deleteByReportId(id);

      // Create new expenses
      if (expenses.length > 0) {
        const expenseData = expenses.map((expense, index) => ({
          ...expense,
          report_certificate_id: id,
          display_order: expense.display_order || index + 1,
          expense_date: new Date(expense.expense_date),
        }));

        await this.expenseRepository.knex('report_certificate_expenses')
          .insert(expenseData);
      }
    }

    return updatedCertificate;
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

    // Soft delete certificate
    await this.certificateRepository.knex('report_certificate')
      .where('id', id)
      .update({
        deleted_at: new Date(),
        updated_at: new Date(),
      });

    // Delete related expenses
    // await this.expenseRepository.deleteByReportId(id);
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
