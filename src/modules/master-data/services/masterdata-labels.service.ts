import { Injectable } from '@nestjs/common';
import { MasterdataLabelsRepository } from '../repositories/masterdata-labels.repository';
import { CreateMasterdataLabelsDto } from '../dto/create-masterdata-labels.dto';
import { MasterdataLabelsQueryDto } from '../dto/masterdata-labels-query.dto';
import { MasterdataLabel } from '../entities/masterdata-labels.entity';
import { UpdateMasterdataLabelsDto } from '../dto/update-masterdata-labels.dto';

@Injectable()
export class MasterdataLabelsService {
  constructor(
    private readonly masterdataLabelsRepository: MasterdataLabelsRepository,
  ) {}

  async findAll(query: MasterdataLabelsQueryDto) {
    const { page, limit, ...conditions } = query;
    return this.masterdataLabelsRepository.findWithPaginationAndSearch(
      page,
      limit,
      conditions,
    );
  }

  async findOne(id: number) {
    return this.masterdataLabelsRepository.findById(id);
  }

  async getWithTableName(tableName: string) {
    return this.masterdataLabelsRepository.getWithTableName(tableName);
  }

  async create(dto: CreateMasterdataLabelsDto): Promise<MasterdataLabel> {
    const entity: Partial<MasterdataLabel> = {
      tableName: dto.table_name,
      tableDescription: dto.table_description,
      documentReference: dto.document_reference,
      documentName: dto.document_name,
      documentDate: dto.document_date ? new Date(dto.document_date) : undefined,
      documentUrl: dto.document_url,
      updatedBy: dto.updated_by,
    };
    return this.masterdataLabelsRepository.create(entity);
  }

  async update(
    id: number,
    dto: UpdateMasterdataLabelsDto,
  ): Promise<MasterdataLabel> {
    const entity: Partial<MasterdataLabel> = {
      documentName: dto.documentName,
    };

    return this.masterdataLabelsRepository.update(id, entity);
  }

  async remove(id: number) {
    return this.masterdataLabelsRepository.delete(id);
  }
}
