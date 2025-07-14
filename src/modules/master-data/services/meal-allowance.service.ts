import { Injectable } from '@nestjs/common';
import { CreateMealAllowanceDto } from '../dto/create-meal-allowance.dto';
import { UpdateMealAllowanceDto } from '../dto/update-meal-allowance.dto';
import { MealAllowanceQueryDto } from '../dto/meal-allowance-query.dto';
import { MealAllowanceRepository } from '../repositories/meal-allowance.repository';
import { toSnakeCase } from '../../../common/utils/case-mapping';

@Injectable()
export class MealAllowanceService {
  constructor(
    private readonly mealAllowanceRepository: MealAllowanceRepository,
  ) {}

  async findAll(query: MealAllowanceQueryDto) {
    return this.mealAllowanceRepository.findWithPaginationAndSearch(query);
  }

  async findOne(meal_allowance_id: number) {
    return this.mealAllowanceRepository
      .findWithLevels({ meal_allowance_id })
      .then((r) => r[0] || null);
  }

  async create(dto: CreateMealAllowanceDto) {
    const snakeCaseDto = await toSnakeCase(dto);
    return this.mealAllowanceRepository.createWithLevels(snakeCaseDto);
  }

  async update(meal_allowance_id: number, dto: UpdateMealAllowanceDto) {
    const snakeCaseDto = await toSnakeCase(dto);
    return this.mealAllowanceRepository.updateWithLevels(
      meal_allowance_id,
      snakeCaseDto,
    );
  }

  async remove(meal_allowance_id: number) {
    return this.mealAllowanceRepository.deleteWithLevels(meal_allowance_id);
  }

  async findWithLevels(query: Record<string, any> = {}) {
    return this.mealAllowanceRepository.findWithLevels(query);
  }
}
