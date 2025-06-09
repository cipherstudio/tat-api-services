import { Injectable } from '@nestjs/common';
import { Employee } from '../entities/employee.entity';
import { KnexBaseRepository } from '../../../common/repositories/knex-base.repository';
import { KnexService } from '../../../database/knex-service/knex.service';
import { toCamelCase } from '../../../common/utils/case-mapping';
import { QueryEmployeeDto } from '../dto/query-employee.dto';
import { ViewPosition4ot } from '../entities/view-position-4ot.entity';

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
    meta: { total: number; limit: number; offset: number };
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
      },
    };
  }

  async findWithQueryWithPosition4ot(query: QueryEmployeeDto): Promise<{
    data: (Employee & { position4ot?: ViewPosition4ot })[];
    meta: { total: number; limit: number; offset: number };
  }> {
    const employeesResult = await this.findWithQuery(query);
    const employees = employeesResult.data;
    const apaPpnNumbers = employees.map((e) => e.apaPpnNumber).filter(Boolean);
    let positions: ViewPosition4ot[] = [];
    if (apaPpnNumbers.length > 0) {
      positions = await this.knex('VIEW_POSITION_4OT').whereIn(
        'POS_POSITIONCODE',
        apaPpnNumbers,
      );
    }
    // toCamelCase ทุก position ก่อนสร้าง map
    const camelPositions = await Promise.all(
      positions.map((p) => toCamelCase<ViewPosition4ot>(p)),
    );
    const positionMap = new Map(
      camelPositions.map((p) => [p.posPositioncode, p]),
    );
    const data = employees.map((e) => ({
      ...e,
      position4ot: positionMap.get(e.apaPpnNumber),
    }));
    return {
      data,
      meta: employeesResult.meta,
    };
  }

  async findByCodeWithPosition4ot(
    code: string,
  ): Promise<(Employee & { position4ot?: ViewPosition4ot }) | undefined> {
    const employee = await this.findByCode(code);
    if (!employee) return undefined;
    let position4ot;
    if (employee.apaPpnNumber) {
      const pos = await this.knex('VIEW_POSITION_4OT')
        .where('POS_POSITIONCODE', employee.apaPpnNumber)
        .first();
      position4ot = pos ? await toCamelCase<ViewPosition4ot>(pos) : undefined;
    }
    return { ...employee, position4ot };
  }
}
