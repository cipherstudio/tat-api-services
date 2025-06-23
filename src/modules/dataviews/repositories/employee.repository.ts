import { Injectable } from '@nestjs/common';
import { Employee } from '../entities/employee.entity';
import { KnexBaseRepository } from '../../../common/repositories/knex-base.repository';
import { KnexService } from '../../../database/knex-service/knex.service';
import { toCamelCase } from '../../../common/utils/case-mapping';
import { QueryEmployeeDto } from '../dto/query-employee.dto';
import { ViewPosition4ot } from '../entities/view-position-4ot.entity';
import { OpLevelSalR } from '../entities/op-level-sal-r.entity';

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

  async findByCode(code: string): Promise<Employee | undefined> {
    const dbEntity = await super.findOne({ CODE: code }, 'CODE');
    return dbEntity ? await toCamelCase<Employee>(dbEntity) : undefined;
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
        offset: query.offset ?? 0,
        lastPage: total === 0 ? 0 : Math.ceil(total / (query.limit ?? 10)) - 1,
      },
    };
  }

  async findWithQueryWithPosition4ot(query: QueryEmployeeDto): Promise<{
    data: (Employee & ViewPosition4ot & OpLevelSalR)[];
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
      .leftJoin('EMPLOYEE', 'OP_MASTER_T.PMT_CODE', 'EMPLOYEE.CODE');

    // Apply filters
    if (query.code) {
      baseBuilder = baseBuilder.whereRaw('RTRIM("PMT_CODE") = ?', [query.code]);
    }
    if (query.name) {
      baseBuilder = baseBuilder.where('EMPLOYEE.NAME', query.name);
    }
    if (query.searchTerm) {
      baseBuilder = baseBuilder.where(
        'EMPLOYEE.NAME',
        'like',
        `%${query.searchTerm}%`,
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
        'EMPLOYEE.*',
        this.knex.raw(
          'row_number() over (partition by "OP_MASTER_T"."PMT_CODE" order by "OP_MASTER_T"."PMT_CODE" asc) as "rn"',
        ),
      ])
      .as('sub');

    const finalQuery = this.knex(subquery)
      .where('rn', 1)
      .limit(query.limit ?? 10)
      .offset(query.offset ?? 0);

    const dbEntities = await finalQuery;
    const data = await Promise.all(
      dbEntities.map(async (e) => await toCamelCase<any>(e)),
    );

    return {
      data,
      meta: {
        total,
        limit: query.limit ?? 10,
        offset: query.offset ?? 0,
        lastPage: total === 0 ? 0 : Math.ceil(total / (query.limit ?? 10)) - 1,
      },
    };
  }

  async findByCodeWithPosition4ot(
    code: string,
  ): Promise<(Employee & ViewPosition4ot & OpLevelSalR) | undefined> {
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
      .first();

    const employeeCamel = employee ? await toCamelCase(employee) : undefined;
    return employeeCamel as
      | (Employee & ViewPosition4ot & OpLevelSalR)
      | undefined;
  }
}
