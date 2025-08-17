import { Injectable } from '@nestjs/common';
import { HolidayWorkRatesRepository } from '../repositories/holiday-work-rates.repository';
import { CreateHolidayWorkRatesDto } from '../dto/create-holiday-work-rates.dto';
import { UpdateHolidayWorkRatesDto } from '../dto/update-holiday-work-rates.dto';
import { HolidayWorkRatesQueryDto } from '../dto/holiday-work-rates-query.dto';

@Injectable()
export class HolidayWorkRatesService {
  constructor(
    private readonly holidayWorkRatesRepository: HolidayWorkRatesRepository,
  ) {}

  async findAll(
    query: HolidayWorkRatesQueryDto,
  ): Promise<{ data: any[]; meta: any }> {
    // กำหนด default และตรวจสอบ page/limit
    const limitRaw = Number(query.limit);
    const pageRaw = Number(query.page);
    const limit = !isNaN(limitRaw) && limitRaw > 0 ? limitRaw : 10;
    const page = !isNaN(pageRaw) && pageRaw > 0 ? pageRaw : 1;
    const { step_level, salary, orderBy, orderDir } = query;
    const filter: any = {};
    if (step_level !== undefined) filter.step_level = step_level;
    if (salary !== undefined) filter.salary = salary;
    return this.holidayWorkRatesRepository.findWithPaginationAndSearch(
      page,
      limit,
      filter,
      orderBy || 'step_level',
      orderDir,
    );
  }

  async findOne(id: number): Promise<any | null> {
    const results = await this.holidayWorkRatesRepository.findWithHours({ id });
    return results[0] || null;
  }

  async findWithSalary(salary: number): Promise<any | null> {
    const results = await this.holidayWorkRatesRepository.findWithHours({
      salary,
    });
    return results[0] || null;
  }

  async create(dto: CreateHolidayWorkRatesDto): Promise<any> {
    // สร้าง holiday_work_rates
    const { hours, ...rateData } = dto;
    const rate = await this.holidayWorkRatesRepository.create(rateData);
    // สร้าง holiday_work_hours
    if (hours && hours.length > 0) {
      const rows = hours.map((h) => ({ ...h, rate_id: rate.id }));
      await this.holidayWorkRatesRepository
        .knex('holiday_work_hours')
        .insert(rows);
    }
    return this.findOne(rate.id);
  }

  async update(id: number, dto: UpdateHolidayWorkRatesDto): Promise<any> {
    const { hours, ...rateData } = dto;
    await this.holidayWorkRatesRepository.update(id, rateData);
    // อัปเดต hours (ลบของเก่าแล้ว insert ใหม่)
    if (hours) {
      await this.holidayWorkRatesRepository
        .knex('holiday_work_hours')
        .where('rate_id', id)
        .del();
      if (hours.length > 0) {
        const rows = hours.map((h) => ({ ...h, rate_id: id }));
        await this.holidayWorkRatesRepository
          .knex('holiday_work_hours')
          .insert(rows);
      }
    }
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.holidayWorkRatesRepository.delete(id);
    await this.holidayWorkRatesRepository
      .knex('holiday_work_hours')
      .where('rate_id', id)
      .del();
  }
}
