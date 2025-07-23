import { Injectable } from '@nestjs/common';
import { KnexBaseRepository } from 'src/common/repositories/knex-base.repository';
import { EntertainmentFormStatus } from '../entities/entertainment-form-status.entity';
import { KnexService } from 'src/database/knex-service/knex.service';

@Injectable()
export class EntertainmentFormStatusRepository extends KnexBaseRepository<EntertainmentFormStatus> {
  constructor(protected readonly knexService: KnexService) {
    super(knexService, 'entertainment_form_status');
  }

  async findAll() {
    return this.knex('entertainment_form_status')
      .orderBy('id', 'asc')
      .select('*');
  }

  async findByName(name: string) {
    return this.knex('entertainment_form_status').where('name', name).first();
  }
}
