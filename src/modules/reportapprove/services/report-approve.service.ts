import { Injectable } from '@nestjs/common';
import { ReportApproveRepository } from '../repositories/report-approve.repository';
import { CreateReportApproveDto } from '../dto/create-report-approve.dto';
import { UpdateReportApproveDto } from '../dto/update-report-approve.dto';
import { ReportApproveQueryDto } from '../dto/report-approve-query.dto';
import { ReportTravellerFormRepository } from '../repositories/report-traveller-form.repository';

@Injectable()
export class ReportApproveService {
  constructor(
    private readonly reportApproveRepo: ReportApproveRepository,
    private readonly reportTravellerFormRepo: ReportTravellerFormRepository,
  ) {}

  async findAll(query: ReportApproveQueryDto) {
    // Filter out undefined and null values
    const filteredConditions = Object.entries(query).reduce(
      (acc, [key, value]) => {
        if (value !== undefined && value !== null) {
          acc[key] = value;
        }
        return acc;
      },
      {} as Record<string, any>,
    );

    const {
      page = 1,
      limit = 10,
      orderBy = 'created_at',
      orderDir = 'desc',
      ...conditions
    } = filteredConditions;

    return this.reportApproveRepo.findWithPaginationAndSearch(
      page,
      limit,
      conditions,
      orderBy,
      orderDir as 'asc' | 'desc',
    );
  }

  async findOne(id: number) {
    return this.reportApproveRepo.findWithId(id);
  }

  async create(dto: CreateReportApproveDto) {
    return this.reportApproveRepo.create(dto);
  }

  async update(id: number, dto: UpdateReportApproveDto) {
    const { reportTravellerForm, ...rest } = dto;
    // Update main report
    const result = await this.reportApproveRepo.update(id, rest);

    if (Array.isArray(reportTravellerForm)) {
      for (const form of reportTravellerForm) {
        form.report_id = id + '';
        const traveller_code = form.travelerCode;

        delete form.travelerCode;
        // Try to find existing form by unique keys (e.g., traveler_id + report_id)
        let existing = null;
        if (form.form_id) {
          existing = await this.reportTravellerFormRepo
            .knex('report_traveller_form')
            .where({ form_id: form.form_id })
            .first();
        } else if (form.traveler_id && form.report_id) {
          existing = await this.reportTravellerFormRepo
            .knex('report_traveller_form')
            .where({
              traveler_id: form.traveler_id,
              report_id: form.report_id,
            })
            .first();
        }

        const data = {
          ...form,
          date: form.date ? this.toOracleDate(form.date) : null,
          travelOrderDate: form.travelOrderDate
            ? this.toOracleDate(form.travelOrderDate)
            : null,
          departureDate: form.departureDate
            ? this.toOracleDate(form.departureDate)
            : null,
          returnDate: form.returnDate
            ? this.toOracleDate(form.returnDate)
            : null,
        };
        if (existing) {
          await this.reportTravellerFormRepo.updateOne(existing.form_id, data);
        } else {
          const { traveller, ...restForm } = data;
          // You may need to map traveller info if needed
          await this.reportTravellerFormRepo.createOne(restForm, {
            name: traveller.name,
            position: traveller.position,
            level: traveller.level,
            type: traveller.type,
            report_id: +form.report_id,
            traveller_code: traveller_code,
          });
        }
      }
    }
    return result;
  }

  async remove(id: number) {
    return this.reportApproveRepo.softDelete(id);
  }

  async softDelete(id: number) {
    return this.reportApproveRepo.softDelete(id);
  }

  toOracleDateString(date) {
    if (!date) return null;
    if (date instanceof Date) {
      return date.toISOString().slice(0, 10);
    }
    if (typeof date === 'string' && date.length >= 10) {
      return date.slice(0, 10);
    }
    return date;
  }

  toOracleDate(date) {
    if (!date) return null;
    if (date instanceof Date) return date;
    if (typeof date === 'string' && date.length >= 10) {
      // '2025-07-02' => new Date('2025-07-02T00:00:00Z')
      return new Date(date.slice(0, 10) + 'T00:00:00Z');
    }
    return new Date(date);
  }
}
