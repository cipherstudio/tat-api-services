import { Injectable } from '@nestjs/common';
import { CreateEntertainmentAllowanceDto } from '../dto/create-entertainment-allowance.dto';
import { UpdateEntertainmentAllowanceDto } from '../dto/update-entertainment-allowance.dto';
import { EntertainmentAllowanceQueryDto } from '../dto/entertainment-allowance-query.dto';
import { EntertainmentAllowanceRepository } from '../repositories/entertainment-allowance.repository';

@Injectable()
export class EntertainmentAllowanceService {
  constructor(
    private readonly entertainmentAllowanceRepository: EntertainmentAllowanceRepository,
  ) {}

  async findAll(query: EntertainmentAllowanceQueryDto) {
    return this.entertainmentAllowanceRepository.findWithPaginationAndSearch(
      query,
    );
  }

  async findOne(id: number) {
    return this.entertainmentAllowanceRepository
      .findWithLevels({ id })
      .then((r) => r[0] || null);
  }

  async create(dto: CreateEntertainmentAllowanceDto) {
    return this.entertainmentAllowanceRepository.createWithLevels(dto);
  }

  async update(id: number, dto: UpdateEntertainmentAllowanceDto) {
    return this.entertainmentAllowanceRepository.updateWithLevels(id, dto);
  }

  async remove(id: number) {
    return this.entertainmentAllowanceRepository.deleteWithLevels(id);
  }

  async getWithLevel(level: number) {
    return this.entertainmentAllowanceRepository.getWithLevel(level);
  }
}
