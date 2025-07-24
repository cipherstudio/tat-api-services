import { Injectable } from '@nestjs/common';
import { KnexService } from '../../../database/knex-service/knex.service';
import { KnexBaseRepository } from '../../../common/repositories/knex-base.repository';
import { MeetingType } from '../entities/meeting-type.entity';

@Injectable()
export class MeetingTypeRepository extends KnexBaseRepository<MeetingType> {
  constructor(knexService: KnexService) {
    super(knexService, 'meeting_types');
  }

  async findActive() {
    return this.knex
      .select('*')
      .from('meeting_types')
      .where('is_active', true)
      .orderBy('sort_order', 'asc');
  }
}
