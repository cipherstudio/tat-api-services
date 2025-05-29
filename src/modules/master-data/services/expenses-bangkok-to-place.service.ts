import { Injectable, BadRequestException } from '@nestjs/common';
import { ExpensesBangkokToPlaceRepository } from '../repositories/expenses-bangkok-to-place.repository';
import { UpsertExpensesBangkokToPlaceDto } from '../dto/upsert-expenses-bangkok-to-place.dto.js';

@Injectable()
export class ExpensesBangkokToPlaceService {
  constructor(private readonly repository: ExpensesBangkokToPlaceRepository) {}

  async upsertBulk(dto: UpsertExpensesBangkokToPlaceDto) {
    // Check if amphurId exists
    const amphur = await this.repository.knex('amphurs').where({ id: dto.amphurId }).first();
    if (!amphur) {
      throw new BadRequestException(`amphurId ${dto.amphurId} does not exist`);
    }

    // ลบของเดิมใน amphurId นี้ก่อน แล้ว insert ใหม่ทั้งหมด
    await this.repository.deleteByAmphurId(dto.amphurId);
    return this.repository.bulkInsert(dto.amphurId, dto.rates);
  }

  async getRatesByAmphur(amphurId: number) {
    return this.repository.findAllPlacesWithRateByAmphurId(amphurId);
  }
} 