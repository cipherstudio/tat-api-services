import { ExpensesVehicle } from '../entities/expenses-vehicle.entity';
import { ExpensesVehicleQueryDto } from '../dto/expenses-vehicle-query.dto';
import { PaginatedResult } from '@common/interfaces/pagination.interface';

export interface IExpensesVehicleRepository {
  findAll(): Promise<ExpensesVehicle[]>;
  findById(id: number): Promise<ExpensesVehicle | null>;
  update(id: number, data: Partial<ExpensesVehicle>): Promise<ExpensesVehicle>;
  findWithPaginationAndSearch(
    page: number,
    limit: number,
    conditions: Record<string, any>,
    orderBy: string,
    direction: 'asc' | 'desc',
    searchTerm?: string,
  ): Promise<PaginatedResult<ExpensesVehicle>>;
}

export interface IExpensesVehicleService {
  findAll(queryOptions?: ExpensesVehicleQueryDto): Promise<PaginatedResult<ExpensesVehicle>>;
  update(id: number, data: Partial<ExpensesVehicle>): Promise<ExpensesVehicle>;
} 