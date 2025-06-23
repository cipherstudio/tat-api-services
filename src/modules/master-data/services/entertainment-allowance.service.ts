import { Injectable } from '@nestjs/common';
import { CreateEntertainmentAllowanceDto } from '../dto/create-entertainment-allowance.dto';
import { UpdateEntertainmentAllowanceDto } from '../dto/update-entertainment-allowance.dto';
import { EntertainmentAllowanceQueryDto } from '../dto/entertainment-allowance-query.dto';
import { EntertainmentAllowanceRepository } from '../repositories/entertainment-allowance.repository';
import { toSnakeCase } from '../../../common/utils/case-mapping';

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

  private mapLevelsIdToPrivilegeId(levels: any[]) {
    if (!levels) return levels;
    return levels
      .filter((l) => l.id !== undefined && l.id !== null)
      .map((l) => ({
        ...l,
        privilegeId: l.id,
      }));
  }

  async create(dto: CreateEntertainmentAllowanceDto) {
    const mappedDto = {
      ...dto,
      levels: this.mapLevelsIdToPrivilegeId(dto.levels),
    };
    const snakeCaseDto = await toSnakeCase(mappedDto);
    const result =
      await this.entertainmentAllowanceRepository.createWithLevels(
        snakeCaseDto,
      );
    if (result && result.success === false) {
      return result;
    }
    return result;
  }

  async update(id: number, dto: UpdateEntertainmentAllowanceDto) {
    const mappedDto = {
      ...dto,
      levels: this.mapLevelsIdToPrivilegeId(dto.levels),
    };
    const snakeCaseDto = await toSnakeCase(mappedDto);
    const result = await this.entertainmentAllowanceRepository.updateWithLevels(
      id,
      snakeCaseDto,
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
