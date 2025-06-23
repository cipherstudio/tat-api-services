import { Injectable } from '@nestjs/common';
import { ReportApproveRepository } from '../repositories/report-approve.repository';
import { CreateReportApproveDto } from '../dto/create-report-approve.dto';
import { UpdateReportApproveDto } from '../dto/update-report-approve.dto';
import { ReportApproveQueryDto } from '../dto/report-approve-query.dto';

@Injectable()
export class ReportApproveService {
  constructor(private readonly reportApproveRepo: ReportApproveRepository) {}

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
    return this.reportApproveRepo.update(id, dto);
  }

  async remove(id: number) {
    return this.reportApproveRepo.softDelete(id);
  }

  async softDelete(id: number) {
    return this.reportApproveRepo.softDelete(id);
  }
}
