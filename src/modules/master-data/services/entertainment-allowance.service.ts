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
    const result =
      await this.entertainmentAllowanceRepository.createWithLevels(dto);
    if (result && result.success === false) {
      return result;
    }
    return result;
  }

  async update(id: number, dto: UpdateEntertainmentAllowanceDto) {
    const result = await this.entertainmentAllowanceRepository.updateWithLevels(
      id,
      dto,
    );
    if (result && result.success === false) {
      return result;
    }
    return result;
  }

  async remove(id: number) {
    return this.entertainmentAllowanceRepository.deleteWithLevels(id);
  }

  async getWithPrivilege(privilegeId: number) {
    return this.entertainmentAllowanceRepository.getWithPrivilege(privilegeId);
  }
}
