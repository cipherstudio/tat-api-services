import { Injectable } from '@nestjs/common';
import { Employee } from '../entities/employee.entity';
import { KnexBaseRepository } from '../../../common/repositories/knex-base.repository';
import { KnexService } from '../../../database/knex-service/knex.service';
import { toCamelCase } from '../../../common/utils/case-mapping';
import { QueryEmployeeDto } from '../dto/query-employee.dto';
import { ViewPosition4ot } from '../entities/view-position-4ot.entity';
import { OpLevelSalR } from '../entities/op-level-sal-r.entity';
import { OpMasterT } from '../entities/op-master-t.entity';

@Injectable()
export class EmployeeRepository extends KnexBaseRepository<Employee> {
  constructor(knexService: KnexService) {
    super(knexService, 'EMPLOYEE');
  }

  async findAll(): Promise<Employee[]> {
    const dbEntities = await super.find();
    return Promise.all(
      dbEntities.map(async (e) => await toCamelCase<Employee>(e)),
    );
  }

  async findByCode(code: string): Promise<
    | (Employee & {
        salaryHistory?: { current?: any; previous?: any };
        isAdmin?: boolean;
      })
    | undefined
  > {
    // Query ข้อมูลหลักจาก OP_MASTER_T
    const dbEntity = await this.knex('OP_MASTER_T')
      .whereRaw('RTRIM("PMT_CODE") = ?', [code])
      .leftJoin('EMPLOYEE', (builder) => {
        builder.on(
          'EMPLOYEE.CODE',
          '=',
          this.knex.raw('RTRIM("OP_MASTER_T"."PMT_CODE")'),
        );
      })
      .leftJoin('VIEW_POSITION_4OT', (builder) => {
        builder.on(
          'VIEW_POSITION_4OT.POS_POSITIONCODE',
          '=',
          this.knex.raw('RTRIM("OP_MASTER_T"."PMT_POS_NO")'),
        );
      })
      .leftJoin('employee_admin', (builder) => {
        builder.on(
          'employee_admin.pmt_code',
          '=',
          this.knex.raw('RTRIM("OP_MASTER_T"."PMT_CODE")'),
        );
      })
      .select([
        'OP_MASTER_T.*',
        'EMPLOYEE.*',
        'VIEW_POSITION_4OT.*',
        this.knex.raw(
          'CASE WHEN employee_admin.id IS NOT NULL THEN 1 ELSE 0 END as is_admin',
        ),
      ])
      .first();

    if (!dbEntity) return undefined;

    // Query PS_PW_JOB เฉพาะ ACTION = 'PAY' และ ACTION_REASON = '001' และ EFFDT ล่าสุด 2 อัน
    const salaryRows = await this.knex('PS_PW_JOB')
      .whereRaw('RTRIM("EMPLID") = ?', [code])
      .andWhere('ACTION', 'PAY')
      .andWhere('ACTION_REASON', '001')
      .leftJoin('OP_LEVEL_SAL_R', (builder) => {
        builder.on(
          'OP_LEVEL_SAL_R.PLV_CODE',
          '=',
          this.knex.raw('RTRIM("PS_PW_JOB"."STEP")'),
        );
      })
      .leftJoin('holiday_work_rates', (builder) => {
        builder.on(
          'holiday_work_rates.salary',
          '=',
          'OP_LEVEL_SAL_R.PLV_SALARY',
        );
      })
      .orderBy('EFFDT', 'desc')
      .limit(2);

    // Helper function to enrich salaryRow with holidayWorkHour
    const enrichWithHolidayWorkHour = async (salaryRow: any) => {
      if (!salaryRow || !salaryRow['id']) return undefined;
      const holidayWorkHour = await this.knex('holiday_work_hours')
        .where('rate_id', salaryRow['id'])
        .andWhere('hour', 1)
        .first();
      return {
        ...salaryRow,
        holidayWorkHour: holidayWorkHour
          ? await toCamelCase(holidayWorkHour)
          : null,
      };
    };

    let salaryHistory: { current?: any; previous?: any } | undefined =
      undefined;
    if (salaryRows.length > 0) {
      const current = await enrichWithHolidayWorkHour(salaryRows[0]);
      const previous = salaryRows[1]
        ? await enrichWithHolidayWorkHour(salaryRows[1])
        : undefined;
      if (current || previous) {
        salaryHistory = {};
        if (current) salaryHistory.current = await toCamelCase(current);
        if (previous) salaryHistory.previous = await toCamelCase(previous);
      } else {
        salaryHistory = undefined;
      }
    }

    const camelEntity = await toCamelCase<Employee>(dbEntity);
    if (salaryHistory && camelEntity && typeof camelEntity === 'object') {
      return Object.assign({}, camelEntity, { salaryHistory });
    }
    return camelEntity;
  }

  async findWithQuery(query: QueryEmployeeDto): Promise<{
    data: Employee[];
    meta: { total: number; limit: number; offset: number; lastPage: number };
  }> {
    const conditions: Record<string, any> = {};
    if (query.code) conditions['CODE'] = query.code;
    if (query.name) conditions['NAME'] = query.name;

    let builder;
    if (query.searchTerm) {
      builder = this.knex(this.tableName).where(
        'NAME',
        'like',
        `%${query.searchTerm}%`,
      );
    } else {
      builder = this.knex(this.tableName).where(conditions);
    }
    if (query.sex) conditions['SEX'] = query.sex;
    if (query.province) conditions['PROVINCE'] = query.province;
    if (query.department) conditions['DEPARTMENT'] = query.department;
    if (query.position) conditions['POSITION'] = query.position;

    if (!query.searchTerm) {
      if (query.minSalary !== undefined)
        builder = builder.andWhere('SALARY', '>=', query.minSalary);
      if (query.maxSalary !== undefined)
        builder = builder.andWhere('SALARY', '<=', query.maxSalary);
    } else {
      if (query.minSalary !== undefined)
        builder = builder.andWhere('SALARY', '>=', query.minSalary);
      if (query.maxSalary !== undefined)
        builder = builder.andWhere('SALARY', '<=', query.maxSalary);
    }
    if (query.limit !== undefined) builder = builder.limit(query.limit);
    if (query.offset !== undefined) builder = builder.offset(query.offset);

    // นับจำนวนทั้งหมด (ไม่ใส่ limit/offset)
    let countQuery;
    if (query.searchTerm) {
      countQuery = this.knex(this.tableName).where(
        'NAME',
        'like',
        `%${query.searchTerm}%`,
      );
    } else {
      countQuery = this.knex(this.tableName).where(conditions);
    }
    if (query.minSalary !== undefined)
      countQuery.andWhere('SALARY', '>=', query.minSalary);
    if (query.maxSalary !== undefined)
      countQuery.andWhere('SALARY', '<=', query.maxSalary);
    const countResult = await this.knex('OP_MASTER_T').count('* as count');
    const total = Number(countResult[0]?.count || 0);

    const dbEntities = await builder.select();
    const data = await Promise.all(
      dbEntities.map(async (e) => await toCamelCase<Employee>(e)),
    );
    return {
      data,
      meta: {
        total,
        limit: query.limit ?? 10,
        offset: query.offset ?? (query.page - 1) * query.limit,
        lastPage: total === 0 ? 0 : Math.ceil(total / (query.limit ?? 10)) - 1,
      },
    };
  }

  async findWithQueryWithPosition4ot(query: QueryEmployeeDto): Promise<{
    data: (Employee & ViewPosition4ot & OpLevelSalR & { isAdmin?: boolean })[];
    meta: { total: number; limit: number; offset: number; lastPage: number };
  }> {
    let baseBuilder = this.knex('OP_MASTER_T')
      .leftJoin('OP_LEVEL_SAL_R', (builder) => {
        builder.on(
          'OP_LEVEL_SAL_R.PLV_CODE',
          '=',
          this.knex.raw('RTRIM("OP_MASTER_T"."PMT_LEVEL_CODE")'),
        );
      })
      .leftJoin('VIEW_POSITION_4OT', (builder) => {
        builder.on(
          'VIEW_POSITION_4OT.POS_POSITIONCODE',
          '=',
          this.knex.raw('RTRIM("OP_MASTER_T"."PMT_POS_NO")'),
        );
      })
      .leftJoin('OP_ORGANIZE_R', (builder) => {
        builder.on(
          'OP_ORGANIZE_R.POG_CODE',
          '=',
          this.knex.raw('RTRIM("VIEW_POSITION_4OT"."POS_DEPT_ID")'),
        );
      })
      .leftJoin('EMPLOYEE', 'OP_MASTER_T.PMT_CODE', 'EMPLOYEE.CODE')
      .leftJoin('employee_admin', (builder) => {
        builder.on(
          'employee_admin.pmt_code',
          '=',
          this.knex.raw('RTRIM("OP_MASTER_T"."PMT_CODE")'),
        );
      });

    // Apply filters
    if (query.code) {
      baseBuilder = baseBuilder.whereRaw(
        'RTRIM("OP_MASTER_T"."PMT_CODE") = ?',
        [query.code],
      );
    }
    if (query.name) {
      baseBuilder = baseBuilder.where('OP_MASTER_T.PMT_NAME_T', query.name);
    }
    if (query.searchTerm) {
      baseBuilder = baseBuilder.where(
        'OP_MASTER_T.PMT_NAME_T',
        'like',
        `%${query.searchTerm}%`,
      );
      baseBuilder = baseBuilder.orWhere(
        'OP_MASTER_T.PMT_NAME_E',
        'like',
        `%${query.searchTerm}%`,
      );
      baseBuilder = baseBuilder.orWhereRaw(
        'RTRIM("OP_MASTER_T"."PMT_CODE") = ?',
        [query.searchTerm],
      );
    }
    if (query.sex) baseBuilder = baseBuilder.where('EMPLOYEE.SEX', query.sex);
    if (query.province)
      baseBuilder = baseBuilder.where('EMPLOYEE.PROVINCE', query.province);
    if (query.department)
      baseBuilder = baseBuilder.where('EMPLOYEE.DEPARTMENT', query.department);
    if (query.position)
      baseBuilder = baseBuilder.where('EMPLOYEE.POSITION', query.position);
    if (query.minSalary !== undefined)
      baseBuilder = baseBuilder.andWhere(
        'EMPLOYEE.SALARY',
        '>=',
        query.minSalary,
      );
    if (query.maxSalary !== undefined)
      baseBuilder = baseBuilder.andWhere(
        'EMPLOYEE.SALARY',
        '<=',
        query.maxSalary,
      );

    // Count total distinct records
    const countQuery = baseBuilder.clone();
    const countResult = await countQuery
      .countDistinct('OP_MASTER_T.PMT_CODE as count')
      .first();
    const total = Number(countResult?.count || 0);

    // Main query with ROW_NUMBER for deduplication
    const subquery = baseBuilder
      .clone()
      .select([
        'OP_MASTER_T.*',
        'OP_LEVEL_SAL_R.*',
        'VIEW_POSITION_4OT.*',
        'OP_ORGANIZE_R.POG_DESC as department_name',
        'EMPLOYEE.*',
        this.knex.raw(
          `TO_NUMBER(CASE WHEN "employee_admin"."id" IS NOT NULL THEN 1 ELSE 0 END) AS "is_admin"`,
        ),
        this.knex.raw(
          `row_number() over (partition by "OP_MASTER_T"."PMT_CODE" order by "OP_MASTER_T"."PMT_CODE" ${query?.orderDir ?? 'asc'} ) as "rn"`,
        ),
      ])
      .as('sub');

    const finalQuery = this.knex(subquery)
      .where('rn', 1)
      .limit(query.limit ?? 10)
      .offset((query?.page - 1) * query.limit);

    const dbEntities = await finalQuery;
    const data = await Promise.all(
      dbEntities.map(async (e) => await toCamelCase<any>(e)),
    );

    return {
      data,
      meta: {
        total,
        limit: query.limit ?? 10,
        offset: (query?.page - 1) * query.limit,
        lastPage: total === 0 ? 0 : Math.ceil(total / (query.limit ?? 10)) - 1,
      },
    };
  }

  async findByCodeWithPosition4ot(
    code: string,
  ): Promise<
    | (OpMasterT & ViewPosition4ot & OpLevelSalR & { isAdmin?: boolean })
    | undefined
  > {
    const employee = await this.knex('OP_MASTER_T')
      .whereRaw('RTRIM("PMT_CODE") = ?', [code])
      .leftJoin('OP_LEVEL_SAL_R', (builder) => {
        builder.on(
          'OP_LEVEL_SAL_R.PLV_CODE',
          '=',
          this.knex.raw('RTRIM("OP_MASTER_T"."PMT_LEVEL_CODE")'),
        );
      })
      .leftJoin('VIEW_POSITION_4OT', (builder) => {
        builder.on(
          'VIEW_POSITION_4OT.POS_POSITIONCODE',
          '=',
          this.knex.raw('RTRIM("OP_MASTER_T"."PMT_POS_NO")'),
        );
      })
      .leftJoin('EMPLOYEE', 'OP_MASTER_T.PMT_CODE', 'EMPLOYEE.CODE')
      .leftJoin('employee_admin', (builder) => {
        builder.on(
          'employee_admin.pmt_code',
          '=',
          this.knex.raw('RTRIM("OP_MASTER_T"."PMT_CODE")'),
        );
      })
      .select([
        'OP_MASTER_T.*',
        'OP_LEVEL_SAL_R.*',
        'VIEW_POSITION_4OT.*',
        'EMPLOYEE.*',
        this.knex.raw(
          'TO_NUMBER(CASE WHEN "employee_admin"."id" IS NOT NULL THEN 1 ELSE 0 END) AS "is_admin"',
        ),
      ])
      .first();

    const employeeCamel = employee ? await toCamelCase(employee) : undefined;
    return employeeCamel as
      | (Employee & ViewPosition4ot & OpLevelSalR & { isAdmin?: boolean })
      | undefined;
  }

  async checkIsAdmin(pmtCode: string): Promise<boolean> {
    const result = await this.knex('employee_admin')
      .where('pmt_code', pmtCode)
      .where('is_active', true)
      .whereNull('deleted_at')
      .first();

    return !!result;
  }
}
