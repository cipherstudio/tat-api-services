import { Injectable } from '@nestjs/common';
import { Employee } from '../entities/employee.entity';
import { KnexBaseRepository } from '../../../common/repositories/knex-base.repository';
import { KnexService } from '../../../database/knex-service/knex.service';
import { toCamelCase } from '../../../common/utils/case-mapping';
import { QueryEmployeeDto } from '../dto/query-employee.dto';

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
    const dbEntity = await super.findOne({ CODE: code });
    return dbEntity ? await toCamelCase<Employee>(dbEntity) : undefined;
  }

  async findWithQuery(query: QueryEmployeeDto): Promise<{
    data: Employee[];
    meta: { total: number; limit: number; offset: number };
  }> {
    const conditions: Record<string, any> = {};
    if (query.code) conditions['CODE'] = query.code;
    if (query.name) conditions['NAME'] = query.name;
    if (query.sex) conditions['SEX'] = query.sex;
    if (query.province) conditions['PROVINCE'] = query.province;
    if (query.department) conditions['DEPARTMENT'] = query.department;
    if (query.position) conditions['POSITION'] = query.position;

    let builder = this.knex(this.tableName).where(conditions);
    if (query.minSalary !== undefined)
      builder = builder.andWhere('SALARY', '>=', query.minSalary);
    if (query.maxSalary !== undefined)
      builder = builder.andWhere('SALARY', '<=', query.maxSalary);
    if (query.limit !== undefined) builder = builder.limit(query.limit);
    if (query.offset !== undefined) builder = builder.offset(query.offset);

    // นับจำนวนทั้งหมด (ไม่ใส่ limit/offset)
    const countQuery = this.knex(this.tableName).where(conditions);
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
}
