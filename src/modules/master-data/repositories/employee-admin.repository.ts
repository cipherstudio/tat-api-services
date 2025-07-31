import { Injectable } from '@nestjs/common';
import { KnexService } from '../../../database/knex-service/knex.service';
import { EmployeeAdmin } from '../entities/employee-admin.entity';
import { KnexBaseRepository } from '../../../common/repositories/knex-base.repository';
import { QueryEmployeeAdminDto } from '../dto/query-employee-admin.dto';
import { PaginatedResult } from '../../../common/interfaces/pagination.interface';

@Injectable()
export class EmployeeAdminRepository extends KnexBaseRepository<EmployeeAdmin> {
  constructor(knexService: KnexService) {
    super(knexService, 'employee_admin');
  }

  async findWithPaginationAndSearch(
    query: QueryEmployeeAdminDto,
  ): Promise<PaginatedResult<EmployeeAdmin>> {
    const { page = 1, limit = 10, ...filters } = query;
    const offset = (page - 1) * limit;

    let queryBuilder = this.knex('employee_admin')
      .whereNull('deleted_at')
      .orderBy('created_at', 'desc');

    if (filters.pmt_code) {
      queryBuilder = queryBuilder.where(
        'pmt_code',
        'like',
        `%${filters.pmt_code}%`,
      );
    }

    if (filters.employee_code) {
      queryBuilder = queryBuilder.where(
        'employee_code',
        'like',
        `%${filters.employee_code}%`,
      );
    }

    if (filters.employee_name) {
      queryBuilder = queryBuilder.where(
        'employee_name',
        'like',
        `%${filters.employee_name}%`,
      );
    }

    if (filters.department) {
      queryBuilder = queryBuilder.where(
        'department',
        'like',
        `%${filters.department}%`,
      );
    }

    if (filters.division) {
      queryBuilder = queryBuilder.where(
        'division',
        'like',
        `%${filters.division}%`,
      );
    }

    if (filters.section) {
      queryBuilder = queryBuilder.where(
        'section',
        'like',
        `%${filters.section}%`,
      );
    }

    if (filters.is_active !== undefined) {
      queryBuilder = queryBuilder.where('is_active', filters.is_active);
    }

    if (filters.is_suspended !== undefined) {
      queryBuilder = queryBuilder.where('is_suspended', filters.is_suspended);
    }

    if (filters.searchTerm) {
      queryBuilder = queryBuilder.where(
        'employee_name',
        'like',
        `%${filters.searchTerm}%`,
      );
      queryBuilder = queryBuilder.orWhere(
        'employee_code',
        'like',
        `%${filters.searchTerm}%`,
      );
      queryBuilder = queryBuilder.orWhere(
        'pmt_code',
        'like',
        `%${filters.searchTerm}%`,
      );
      queryBuilder = queryBuilder.orWhere(
        'department',
        'like',
        `%${filters.searchTerm}%`,
      );
      queryBuilder = queryBuilder.orWhere(
        'division',
        'like',
        `%${filters.searchTerm}%`,
      );
      queryBuilder = queryBuilder.orWhere(
        'section',
        'like',
        `%${filters.searchTerm}%`,
      );
    }

    const totalCount = await queryBuilder.clone().count('* as count').first();
    const total = parseInt(totalCount.count as string);

    const data = await queryBuilder
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async findByPmtCode(pmtCode: string): Promise<EmployeeAdmin | null> {
    const result = await this.knexService
      .knex('employee_admin')
      .where('pmt_code', pmtCode)
      .whereNull('deleted_at')
      .first();

    return result || null;
  }

  async findByEmployeeCode(
    employeeCode: string,
  ): Promise<EmployeeAdmin | null> {
    const result = await this.knexService
      .knex('employee_admin')
      .where('employee_code', employeeCode)
      .whereNull('deleted_at')
      .first();

    return result || null;
  }

  async findActiveEmployees(): Promise<EmployeeAdmin[]> {
    return await this.knexService
      .knex('employee_admin')
      .where('is_active', true)
      .whereNull('deleted_at')
      .orderBy('created_at', 'desc');
  }

  async findActiveNonSuspendedEmployees(): Promise<EmployeeAdmin[]> {
    return await this.knexService
      .knex('employee_admin')
      .where('is_active', true)
      .where('is_suspended', false)
      .whereNull('deleted_at')
      .orderBy('created_at', 'desc');
  }

  async suspendEmployee(
    id: number,
    suspendedUntil: Date,
    updatedBy: string,
  ): Promise<void> {
    await this.knexService.knex('employee_admin').where('id', id).update({
      is_suspended: true,
      suspended_until: suspendedUntil,
      updated_by: updatedBy,
      updated_at: this.knexService.knex.fn.now(),
    });
  }

  async activateEmployee(id: number, updatedBy: string): Promise<void> {
    await this.knexService.knex('employee_admin').where('id', id).update({
      is_suspended: false,
      suspended_until: null,
      updated_by: updatedBy,
      updated_at: this.knexService.knex.fn.now(),
    });
  }

  async softDelete(id: number): Promise<void> {
    await this.knexService.knex('employee_admin').where('id', id).update({
      deleted_at: this.knexService.knex.fn.now(),
    });
  }
}
