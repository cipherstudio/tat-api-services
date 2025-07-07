import { Injectable, Inject } from '@nestjs/common';
import { KnexBaseRepository } from 'src/common/repositories/knex-base.repository';
import { KnexService } from 'src/database/knex-service/knex.service';
import { ReportTravellerForm } from '../entities/report-traveller-form.entity';
import { CreateReportTravellerFormDto } from '../dto/create-report-traveller-form.dto';
import { CreateReportTravellerDto } from '../dto/create-report-traveller.dto';
import { toSnakeCase, toCamelCase } from 'src/common/utils/case-mapping';

@Injectable()
export class ReportTravellerFormRepository extends KnexBaseRepository<ReportTravellerForm> {
  constructor(
    @Inject(KnexService) protected readonly knexService: KnexService,
  ) {
    super(knexService, 'report_traveller_form');
  }

  // Helper to create traveller if not exists, returns traveler_id
  private async ensureTraveller(
    traveller: CreateReportTravellerDto,
  ): Promise<number> {
    // Check if traveller exists by unique keys (report_id + name)
    const existing = await this.knex('report_traveller')
      .where({ report_id: traveller.report_id, name: traveller.name })
      .first();
    if (existing) {
      //update traveller
      await this.knex('report_traveller')
        .where({ traveler_id: existing.traveler_id })
        .update(await toSnakeCase(traveller));
      return existing.traveler_id;
    } else {
      //create traveller
      const [created] = await this.knex('report_traveller')
        .insert(await toSnakeCase(traveller))
        .returning('*');
      return created.traveler_id;
    }
  }

  // Accepts form DTO and traveller DTO
  async createOne(
    formDto: CreateReportTravellerFormDto,
    travellerDto: CreateReportTravellerDto,
  ): Promise<ReportTravellerForm> {
    const traveler_id = await this.ensureTraveller(travellerDto);
    const data = await toSnakeCase({ ...formDto, traveler_id });
    const [created] = await this.knex('report_traveller_form')
      .insert(data)
      .returning('*');
    return toCamelCase<ReportTravellerForm>(created);
  }

  async updateOne(
    form_id: number,
    dto: Partial<CreateReportTravellerFormDto>,
  ): Promise<ReportTravellerForm> {
    try {
      const data = await toSnakeCase(dto);
      const { traveller, ...restForm } = data;
      console.log('🚀 ~ ReportTravellerFormRepository ~ restForm:', restForm);
      if (traveller) {
        await this.knex('report_traveller')
          .where({ traveler_id: traveller.traveler_id })
          .update(await toSnakeCase(traveller));
      }
      const updated = await this.knex('report_traveller_form')
        .where({ form_id })
        .update({
          ...restForm,
          updated_at: new Date(),
        });

      return toCamelCase<ReportTravellerForm>(updated);
    } catch (error) {
      console.log('🚀 ~ ReportTravellerFormRepository ~ error:', error);
      throw error;
    }
  }

  // Accepts array of { formDto, travellerDto }
  async createMany(
    items: {
      formDto: CreateReportTravellerFormDto;
      travellerDto: CreateReportTravellerDto;
    }[],
  ): Promise<ReportTravellerForm[]> {
    const results: ReportTravellerForm[] = [];
    for (const { formDto, travellerDto } of items) {
      const traveler_id = await this.ensureTraveller(travellerDto);
      const data = await toSnakeCase({ ...formDto, traveler_id });
      const [created] = await this.knex('report_traveller_form')
        .insert(data)
        .returning('*');
      results.push(await toCamelCase<ReportTravellerForm>(created));
    }
    return results;
  }

  async updateMany(
    updates: { form_id: number; data: Partial<CreateReportTravellerFormDto> }[],
  ): Promise<ReportTravellerForm[]> {
    const results: ReportTravellerForm[] = [];
    for (const { form_id, data } of updates) {
      const updated = await this.updateOne(form_id, data);
      results.push(updated);
    }
    return results;
  }
}
