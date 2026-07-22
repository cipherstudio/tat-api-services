import { Injectable, NotFoundException } from '@nestjs/common';
import { TrainingCountriesRepository } from '../repositories/training-countries.repository';
import { CreateTrainingCountryDto } from '../dto/create-training-countries.dto';
import { UpdateTrainingCountryDto } from '../dto/update-training-countries.dto';

@Injectable()
export class TrainingCountriesService {
  constructor(private readonly repository: TrainingCountriesRepository) {}

  create(dto: CreateTrainingCountryDto) { return this.repository.create(dto); }
  findAll(options: { page?: number; limit?: number; orderBy?: string; orderDir?: 'ASC' | 'DESC'; searchTerm?: string }) {
    return this.repository.findWithPaginationAndSearch(options.page || 1, options.limit || 10, options.orderBy || 'id', (options.orderDir || 'ASC').toLowerCase() as 'asc' | 'desc', options.searchTerm);
  }
  async findById(id: number) {
    const result = await this.repository.findById(id);
    if (!result) throw new NotFoundException(`Training country with ID ${id} not found`);
    return result;
  }
  async update(id: number, dto: UpdateTrainingCountryDto) {
    await this.findById(id);
    return this.repository.update(id, dto);
  }
  async remove(id: number) {
    await this.findById(id);
    await this.repository.delete(id);
  }
}
