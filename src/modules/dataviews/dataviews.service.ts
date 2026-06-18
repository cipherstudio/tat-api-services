import { Injectable } from '@nestjs/common';
import { RedisCacheService } from '../cache/redis-cache.service';
import { DataviewsRepository } from './repositories/dataviews.repository';
import { Employee, EmployeePaginate } from './entities/employee.entity';
import { EmployeeRepository } from './repositories/employee.repository';
import { QueryEmployeeDto } from './dto/query-employee.dto';
import {
  AbDeputy,
  AbDeputyPaginate,
  EmployeeDeputyPublic,
} from './entities/ab-deputy.entity';
import { buildEmployeeDeputyPublic } from './utils/employee-deputy-public.mapper';
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
import { PsPwJobPaginate } from './entities/ps-pw-job.entity';
import { PsPwJobRepository } from './repositories/ps-pw-job.repository';
import { QueryPsPwJobDto } from './dto/query-ps-pw-job.dto';
import {
  OpLevelSalRRepository,
  OpLevelSalRPaginate,
} from './repositories/op-level-sal-r.repository';
import { QueryOpLevelSalRDto } from './dto/query-op-level-sal-r.dto';
import { VTxTattrasPaginate } from './entities/v-tx-tattras.entity';
import { VTxTattrasRepository } from './repositories/v-tx-tattras.repository';
import { QueryVTxTattrasDto } from './dto/query-v-tx-tattras.dto';
import {
  ViewDependentBenef,
  ViewDependentBenefPaginate,
  ViewDependentBenefSpouseTatStaff,
} from './entities/view-dependent-benef.entity';
import { OpMasterT } from './entities/op-master-t.entity';
import { ViewDependentBenefRepository } from './repositories/view-dependent-benef.repository';
import { QueryViewDependentBenefDto } from './dto/query-view-dependent-benef.dto';

const SPOUSE_DEP_RELATION_CODES = new Set(['SP']);

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
    private readonly psPwJobRepository: PsPwJobRepository,
    private readonly opLevelSalRRepository: OpLevelSalRRepository,
    private readonly vTxTattrasRepository: VTxTattrasRepository,
    private readonly viewDependentBenefRepository: ViewDependentBenefRepository,
  ) {}

  private mapDeputiesForEmployeeResponse(
    deputies: AbDeputy[],
  ): EmployeeDeputyPublic[] {
    return deputies.map((d) =>
      buildEmployeeDeputyPublic({
        deputyOrganize: d.deputyOrganize,
        deputyExecutive: d.deputyExecutive,
      }),
    );
  }

  /**
   * พนักงานใหม่ที่มีแค่ใน OP_MASTER_T (ยังไม่ sync เข้า EMPLOYEE table) จะได้ name/code (จาก EMPLOYEE) = null
   * → fallback ไป pmtNameT/pmtCode (OP_MASTER_T) เพื่อให้ทุก consumer (search/แสดงชื่อ/เลือกบุคคล) ใช้ได้
   */
  private resolveEmployeeNameCode<T extends Record<string, any>>(e: T): T {
    if (!e || typeof e !== 'object') return e;
    return {
      ...e,
      name: e.name ?? e.pmtNameT ?? null,
      code: e.code ?? e.pmtCode ?? null,
    };
  }

  async findAllEmployees(): Promise<Employee[]> {
    return this.employeeRepository.findAll();
  }

  async findEmployeeByCode(code: string): Promise<any | undefined> {
    const [employee, deputies] = await Promise.all([
      this.employeeRepository.findByCode(code),
      this.abDeputyRepository.findByPmtCode(code),
    ]);
    if (!employee) return undefined;
    return {
      ...this.resolveEmployeeNameCode(employee),
      deputies: this.mapDeputiesForEmployeeResponse(deputies),
    };
  }

  async findEmployeeByCodeWithPosition4ot(
    code: string,
  ): Promise<any | undefined> {
    const [employee, deputies] = await Promise.all([
      this.employeeRepository.findByCodeWithPosition4ot(code),
      this.abDeputyRepository.findByPmtCode(code),
    ]);
    if (!employee) return undefined;
    return {
      ...this.resolveEmployeeNameCode(employee),
      deputies: this.mapDeputiesForEmployeeResponse(deputies),
    };
  }

  async checkEmployeeIsAdmin(pmtCode: string): Promise<boolean> {
    return this.employeeRepository.checkIsAdmin(pmtCode);
  }

  async findEmployeesWithQuery(
    query: QueryEmployeeDto,
  ): Promise<EmployeePaginate> {
    const paginated =
      await this.employeeRepository.findWithQueryWithPosition4ot(query);
    const pmtCodes = paginated.data
      .map((e: Employee & Record<string, unknown>) =>
        String(e.pmtCode ?? e.code ?? '').trim(),
      )
      .filter((c) => c.length > 0);
    const deputiesByPmt =
      await this.abDeputyRepository.findByPmtCodesGrouped(pmtCodes);
    const data = paginated.data.map((e: Employee & Record<string, unknown>) => {
      const code = String(e.pmtCode ?? e.code ?? '').trim();
      const deputies = deputiesByPmt.get(code) ?? [];
      return {
        ...this.resolveEmployeeNameCode(e),
        deputies: this.mapDeputiesForEmployeeResponse(deputies),
      };
    });
    return { ...paginated, data };
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

  async findPsPwJobWithQuery(query: QueryPsPwJobDto): Promise<PsPwJobPaginate> {
    return this.psPwJobRepository.findWithQuery(query);
  }

  async findOpLevelSalRWithQuery(
    query: QueryOpLevelSalRDto,
  ): Promise<OpLevelSalRPaginate> {
    return this.opLevelSalRRepository.findWithQuery(query);
  }

  async findVTxTattrasWithQuery(
    query: QueryVTxTattrasDto,
  ): Promise<VTxTattrasPaginate> {
    return this.vTxTattrasRepository.findWithQuery(query);
  }

  async findViewDependentBenefWithQuery(
    query: QueryViewDependentBenefDto,
  ): Promise<ViewDependentBenefPaginate> {
    const page = await this.viewDependentBenefRepository.findWithQuery(query);
    return {
      ...page,
      data: await this.enrichViewDependentBenefList(page.data),
    };
  }

  async findViewDependentBenefByEmployeeCode(
    employeeCode: string,
  ): Promise<ViewDependentBenef[]> {
    const rows =
      await this.viewDependentBenefRepository.findByEmployeeCode(employeeCode);
    return this.enrichViewDependentBenefList(rows);
  }

  private isSpouseDepRelation(depRelation?: string): boolean {
    const k = String(depRelation ?? '').trim().toUpperCase();
    return SPOUSE_DEP_RELATION_CODES.has(k);
  }

  private buildSpouseNameCandidates(row: ViewDependentBenef): string[] {
    const out: string[] = [];
    const add = (s: string) => {
      const n = String(s ?? '')
        .trim()
        .replace(/\s+/g, ' ');
      if (n.length > 0 && !out.includes(n)) out.push(n);
    };
    add(String(row.depEmployeeHrname ?? ''));
    add(
      [row.depHornorificname, row.depFirstname, row.depLastname]
        .map((x) => String(x ?? '').trim())
        .filter((x) => x.length > 0)
        .join(' '),
    );
    add(
      [row.depFirstname, row.depLastname]
        .map((x) => String(x ?? '').trim())
        .filter((x) => x.length > 0)
        .join(' '),
    );
    return out;
  }

  private async enrichSingleDependentBenef(
    row: ViewDependentBenef,
  ): Promise<ViewDependentBenef> {
    if (!this.isSpouseDepRelation(row.depRelation)) {
      return row;
    }
    let master: OpMasterT | null = null;
    for (const name of this.buildSpouseNameCandidates(row)) {
      master = await this.opMasterTRepository.findFirstByPmtNameTMatch(name);
      if (master) break;
    }
    if (!master) {
      return row;
    }
    const [position4ot, exPosition] = await Promise.all([
      this.viewPosition4otRepository.findFirstByTrimmedPositionCode(
        master.pmtPosNo,
      ),
      this.employeeRepository.findExPositionByPmtCode(
        String(master.pmtCode ?? ''),
      ),
    ]);
    const levelRaw =
      master.pmtLevelCode != null ? String(master.pmtLevelCode).trim() : '';
    const posPositionname =
      String(position4ot?.posPositionname ?? '').trim() || undefined;
    const spouseTatStaff: ViewDependentBenefSpouseTatStaff =
      levelRaw.length > 0
        ? {
            staffType: 'employee',
            pmtCode: master.pmtCode,
            pmtNameT: master.pmtNameT,
            pmtNameE: master.pmtNameE,
            pmtLevelCode: levelRaw,
            exPosition,
            posPositionname,
          }
        : {
            staffType: 'contractor',
            pmtCode: master.pmtCode,
            pmtNameT: master.pmtNameT,
            pmtNameE: master.pmtNameE,
            exPosition,
            posPositionname,
          };
    return { ...row, spouseTatStaff };
  }

  private async enrichViewDependentBenefList(
    rows: ViewDependentBenef[],
  ): Promise<ViewDependentBenef[]> {
    return Promise.all(rows.map((r) => this.enrichSingleDependentBenef(r)));
  }
}
