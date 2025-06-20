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
    const countResult = await countQuery.count('* as count').first();
    const total = Number(countResult?.count || 0);

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
        lastPage: Math.ceil(total / (query.limit ?? 10)) - 1,
      },
    };
  }

  async findWithQueryWithPosition4ot(query: QueryEmployeeDto): Promise<{
    data: (Employee & ViewPosition4ot & OpLevelSalR)[];
    meta: { total: number; limit: number; offset: number; lastPage: number };
  }> {
    let builder = this.knex('OP_MASTER_T')
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

    if (query.code) {
      builder = builder.whereRaw('RTRIM("PMT_CODE") = ?', [query.code]);
    }

    if (query.name) {
      builder = builder.where('EMPLOYEE.NAME', query.name);
    }

    if (query.searchTerm) {
      builder = builder.where('EMPLOYEE.NAME', 'like', `%${query.searchTerm}%`);
    }

    if (query.sex) builder = builder.where('EMPLOYEE.SEX', query.sex);
    if (query.province)
      builder = builder.where('EMPLOYEE.PROVINCE', query.province);
    if (query.department)
      builder = builder.where('EMPLOYEE.DEPARTMENT', query.department);
    if (query.position)
      builder = builder.where('EMPLOYEE.POSITION', query.position);

    if (query.minSalary !== undefined)
      builder = builder.andWhere('EMPLOYEE.SALARY', '>=', query.minSalary);
    if (query.maxSalary !== undefined)
      builder = builder.andWhere('EMPLOYEE.SALARY', '<=', query.maxSalary);

    const countQuery = builder.clone();
    countQuery.select(this.knex.raw('count(*) as count'));
    countQuery.limit(0).offset(0);
    const countResult = await countQuery.first();
    const total = Number(countResult?.count || 0);

    if (query.limit !== undefined) builder = builder.limit(query.limit);
    if (query.offset !== undefined) builder = builder.offset(query.offset);

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
        lastPage: Math.ceil(total / (query.limit ?? 10)) - 1,
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
