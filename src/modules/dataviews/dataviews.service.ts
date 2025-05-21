import { Injectable } from '@nestjs/common';
import { RedisCacheService } from '../cache/redis-cache.service';
import { DataviewsRepository } from './repositories/dataviews.repository';
import { Employee, EmployeePaginate } from './entities/employee.entity';
import { EmployeeRepository } from './repositories/employee.repository';
import { QueryEmployeeDto } from './dto/query-employee.dto';
import { AbDeputyPaginate } from './entities/ab-deputy.entity';
import { AbDeputyRepository } from './repositories/ab-deputy.repository';
import { QueryAbDeputyDto } from './dto/query-ab-deputy.dto';
import { AbHoliday, AbHolidayPaginate } from './entities/ab-holiday.entity';
import { AbHolidayRepository } from './repositories/ab-holiday.repository';
import { QueryAbHolidayDto } from './dto/query-ab-holiday.dto';
import { OpChildrenTPaginate } from './entities/op-children-t.entity';
import { OpChildrenTRepository } from './repositories/op-children-t.repository';
import { QueryOpChildrenTDto } from './dto/query-op-children-t.dto';
import { OpHeadTPaginate } from './entities/op-head-t.entity';
import { OpHeadTRepository } from './repositories/op-head-t.repository';
import { QueryOpHeadTDto } from './dto/query-op-head-t.dto';
import { OpMasterTPaginate } from './entities/op-master-t.entity';
import { OpMasterTRepository } from './repositories/op-master-t.repository';
import { QueryOpMasterTDto } from './dto/query-op-master-t.dto';
import { OpOrganizeRPaginate } from './entities/op-organize-r.entity';
import { OpOrganizeRRepository } from './repositories/op-organize-r.repository';
import { QueryOpOrganizeRDto } from './dto/query-op-organize-r.dto';
import { OpPositionNoTPaginate } from './entities/op-position-no-t.entity';
import { OpPositionNoTRepository } from './repositories/op-position-no-t.repository';
import { QueryOpPositionNoTDto } from './dto/query-op-position-no-t.dto';
import { OpPosExecutiveRPaginate } from './entities/op-pos-executive-r.entity';
import { OpPosExecutiveRRepository } from './repositories/op-pos-executive-r.repository';
import { QueryOpPosExecutiveRDto } from './dto/query-op-pos-executive-r.dto';
import { OpPositionTPaginate } from './entities/op-position-t.entity';
import { OpPositionTRepository } from './repositories/op-position-t.repository';
import { QueryOpPositionTDto } from './dto/query-op-position-t.dto';
import { OpPosWorkRRepository } from './repositories/op-pos-work-r.repository';
import { ViewPosition4otPaginate } from './entities/view-position-4ot.entity';
import { ViewPosition4otRepository } from './repositories/view-position-4ot.repository';
import { QueryViewPosition4otDto } from './dto/query-view-position-4ot.dto';
import { VBudgetCodePaginate } from './entities/v-budget-code.entity';
import { VBudgetCodeRepository } from './repositories/v-budget-code.repository';
import { QueryVBudgetCodeDto } from './dto/query-v-budget-code.dto';
import { VTxOtPaginate } from './entities/v-tx-ot.entity';
import { VTxOtRepository } from './repositories/v-tx-ot.repository';
import { QueryVTxOtDto } from './dto/query-v-tx-ot.dto';

@Injectable()
export class DataviewsService {
  private readonly CACHE_PREFIX = 'dataviews';
  private readonly CACHE_TTL = 3600; // 1 hour in seconds

  constructor(
    private readonly dataviewsRepository: DataviewsRepository,
    private readonly cacheService: RedisCacheService,
    private readonly employeeRepository: EmployeeRepository,
    private readonly abDeputyRepository: AbDeputyRepository,
    private readonly abHolidayRepository: AbHolidayRepository,
    private readonly opChildrenTRepository: OpChildrenTRepository,
    private readonly opHeadTRepository: OpHeadTRepository,
    private readonly opMasterTRepository: OpMasterTRepository,
    private readonly opOrganizeRRepository: OpOrganizeRRepository,
    private readonly opPositionNoTRepository: OpPositionNoTRepository,
    private readonly opPosExecutiveRRepository: OpPosExecutiveRRepository,
    private readonly opPosWorkRRepository: OpPosWorkRRepository,
    private readonly opPositionTRepository: OpPositionTRepository,
    private readonly viewPosition4otRepository: ViewPosition4otRepository,
    private readonly vBudgetCodeRepository: VBudgetCodeRepository,
    private readonly vTxOtRepository: VTxOtRepository,
  ) {}

  async findAllEmployees(): Promise<Employee[]> {
    return this.employeeRepository.findAll();
  }

  async findEmployeeByCode(code: string): Promise<Employee | undefined> {
    return this.employeeRepository.findByCode(code);
  }

  async findEmployeesWithQuery(
    query: QueryEmployeeDto,
  ): Promise<EmployeePaginate> {
    return this.employeeRepository.findWithQuery(query);
  }

  async findAbDeputiesWithQuery(
    query: QueryAbDeputyDto,
  ): Promise<AbDeputyPaginate> {
    return this.abDeputyRepository.findWithQuery(query);
  }

  async findAbHolidayWithQuery(
    query: QueryAbHolidayDto,
  ): Promise<AbHolidayPaginate> {
    return this.abHolidayRepository.findWithQuery(query);
  }

  async findAbHolidayCurrentYear(): Promise<AbHoliday[]> {
    return this.abHolidayRepository.findCurrentYear();
  }

  async findOpChildrenTWithQuery(
    query: QueryOpChildrenTDto,
  ): Promise<OpChildrenTPaginate> {
    return this.opChildrenTRepository.findWithQuery(query);
  }

  async findOpHeadTWithQuery(query: QueryOpHeadTDto): Promise<OpHeadTPaginate> {
    return this.opHeadTRepository.findWithQuery(query);
  }

  async findOpMasterTWithQuery(
    query: QueryOpMasterTDto,
  ): Promise<OpMasterTPaginate> {
    return this.opMasterTRepository.findWithQuery(query);
  }

  async findOpOrganizeRWithQuery(
    query: QueryOpOrganizeRDto,
  ): Promise<OpOrganizeRPaginate> {
    return this.opOrganizeRRepository.findWithQuery(query);
  }

  async findOpPositionNoTWithQuery(
    query: QueryOpPositionNoTDto,
  ): Promise<OpPositionNoTPaginate> {
    return this.opPositionNoTRepository.findWithQuery(query);
  }

  async findOpPosExecutiveRWithQuery(
    query: QueryOpPosExecutiveRDto,
  ): Promise<OpPosExecutiveRPaginate> {
    return this.opPosExecutiveRRepository.findWithQuery(query);
  }

  async findOpPositionTWithQuery(
    query: QueryOpPositionTDto,
  ): Promise<OpPositionTPaginate> {
    return this.opPositionTRepository.findWithQuery(query);
  }

  async findViewPosition4otWithQuery(
    query: QueryViewPosition4otDto,
  ): Promise<ViewPosition4otPaginate> {
    return this.viewPosition4otRepository.findWithQuery(query);
  }

  async findVBudgetCodeWithQuery(
    query: QueryVBudgetCodeDto,
  ): Promise<VBudgetCodePaginate> {
    return this.vBudgetCodeRepository.findWithQuery(query);
  }

  async findVTxOtWithQuery(query: QueryVTxOtDto): Promise<VTxOtPaginate> {
    return this.vTxOtRepository.findWithQuery(query);
  }
}
