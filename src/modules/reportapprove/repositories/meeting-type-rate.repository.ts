import { Injectable } from '@nestjs/common';
import { KnexService } from '../../../database/knex-service/knex.service';
import { KnexBaseRepository } from '../../../common/repositories/knex-base.repository';
import { MeetingTypeRate } from '../entities/meeting-type-rate.entity';

@Injectable()
export class MeetingTypeRateRepository extends KnexBaseRepository<MeetingTypeRate> {
  constructor(knexService: KnexService) {
    super(knexService, 'meeting_type_rates');
  }

  async findByMeetingTypeAndDate(meetingTypeId: number, date: string) {
    return this.knex
      .select('*')
      .from('meeting_type_rates')
      .where('meeting_type_id', meetingTypeId)
      .where('is_active', true)
      .where('effective_date', '<=', date)
      .where(function () {
        this.whereNull('expiry_date').orWhere('expiry_date', '>=', date);
      })
      .orderBy('effective_date', 'desc');
  }

  async findActiveRates() {
    return this.knex
      .select('*')
      .from('meeting_type_rates')
      .where('is_active', true)
      .orderBy('meeting_type_id', 'asc')
      .orderBy('meal_type', 'asc')
      .orderBy('meal_period', 'asc');
  }
}
