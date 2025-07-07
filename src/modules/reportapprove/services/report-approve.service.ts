import { Injectable } from '@nestjs/common';
import { ReportApproveRepository } from '../repositories/report-approve.repository';
import { CreateReportApproveDto } from '../dto/create-report-approve.dto';
import { UpdateReportApproveDto } from '../dto/update-report-approve.dto';
import { ReportApproveQueryDto } from '../dto/report-approve-query.dto';
import { ReportTravellerFormRepository } from '../repositories/report-traveller-form.repository';
import { ReportDailyTravelDetailRepository } from '../repositories/report-daily-travel-detail.repository';

@Injectable()
export class ReportApproveService {
  constructor(
    private readonly reportApproveRepo: ReportApproveRepository,
    private readonly reportTravellerFormRepo: ReportTravellerFormRepository,
    private readonly reportDailyTravelDetailRepo: ReportDailyTravelDetailRepository,
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
        form.reportId = id;
        const traveller_code = form.travelerCode;
        delete form.travelerCode;
        let existing = null;
        if (form.travelerId && form.reportId) {
          existing = await this.reportTravellerFormRepo
            .knex('report_traveller_form')
            .where({
              traveler_id: form.travelerId,
              report_id: form.reportId,
            })
            .first();
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { formId, ...restForm } = form;
        const data = {
          ...restForm,
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
          const { dailyTravelDetails, ...restForm } = data;
          await this.reportTravellerFormRepo.updateOne(
            existing.form_id,
            restForm,
          );
          // --- dailyTravelDetails sync ---
          if (dailyTravelDetails) {
            // 1. หา detailId ทั้งหมดที่ส่งมา
            const incomingIds = dailyTravelDetails
              .filter((d) => d.detailId)
              .map((d) => d.detailId);
            // 2. หา detail ปัจจุบันใน DB
            const currentDetails =
              await this.reportDailyTravelDetailRepo.findByFormId(
                existing.form_id,
              );
            const currentIds = currentDetails.map((d) => d.detailId);
            // 3. ลบ detail ที่ไม่มีใน incoming
            for (const id of currentIds) {
              if (!incomingIds.includes(id)) {
                await this.reportDailyTravelDetailRepo.delete(id);
              }
            }
            // 4. อัปเดตหรือสร้างใหม่
            for (const detail of dailyTravelDetails) {
              if (detail.detailId) {
                await this.reportDailyTravelDetailRepo.updateOne(
                  detail.detailId,
                  {
                    ...detail,
                    departureDate: this.toOracleDate(detail.departureDate),
                    returnDate: this.toOracleDate(detail.returnDate),
                  },
                );
              } else {
                await this.reportDailyTravelDetailRepo.createOne({
                  ...detail,
                  formId: +existing.form_id,
                  departureDate: this.toOracleDate(detail.departureDate),
                  returnDate: this.toOracleDate(detail.returnDate),
                });
              }
            }
          } else {
            // ถ้าไม่มี dailyTravelDetails ส่งมาเลย ให้ลบทั้งหมด
            const currentDetails =
              await this.reportDailyTravelDetailRepo.findByFormId(
                existing.form_id,
              );
            for (const d of currentDetails) {
              await this.reportDailyTravelDetailRepo.delete(d.detailId);
            }
          }
        } else {
          const { traveller, dailyTravelDetails, ...restForm } = data;
          // You may need to map traveller info if needed
          const createdForm = await this.reportTravellerFormRepo.createOne(
            restForm,
            {
              name: traveller.name,
              position: traveller.position,
              level: traveller.level,
              type: traveller.type,
              report_id: +form.reportId,
              traveller_code: traveller_code,
            },
          );
          if (dailyTravelDetails) {
            for (const detail of dailyTravelDetails) {
              await this.reportDailyTravelDetailRepo.createOne({
                ...detail,
                formId: +createdForm.form_id,
                departureDate: this.toOracleDate(detail.departureDate),
                returnDate: this.toOracleDate(detail.returnDate),
              });
            }
          }
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

  toOracleDateString(date: Date | string) {
    if (!date) return null;
    if (date instanceof Date) {
      return date.toISOString().slice(0, 10);
    }
    if (typeof date === 'string' && date.length >= 10) {
      return date.slice(0, 10);
    }
    return date;
  }

  toOracleDate(date: Date | string) {
    if (!date) return null;
    if (date instanceof Date) return date;
    if (typeof date === 'string' && date.length >= 10) {
      // '2025-07-02' => new Date('2025-07-02T00:00:00Z')
      return new Date(date.slice(0, 10) + 'T00:00:00Z');
    }
    return new Date(date);
  }
}
