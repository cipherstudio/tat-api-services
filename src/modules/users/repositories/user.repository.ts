import { Injectable } from '@nestjs/common';
import { User, UserRole } from '../entities/user.entity';
import { KnexBaseRepository } from '../../../common/repositories/knex-base.repository';
import { KnexService } from '../../../database/knex-service/knex.service';
import { toCamelCase, toSnakeCase } from '../../../common/utils/case-mapping';

@Injectable()
export class UserRepository extends KnexBaseRepository<User> {
  constructor(knexService: KnexService) {
    super(knexService, 'users');
  }

  async create(user: Partial<User>): Promise<User> {
    const dbUser = await toSnakeCase(user);
    const created = await super.create(dbUser);
    return await toCamelCase<User>(created);
  }

  async update(id: number, user: Partial<User>): Promise<User> {
    const dbUser = await toSnakeCase(user);
    const updated = await super.update(id, dbUser);
    return await toCamelCase<User>(updated);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const dbUser = await this.knexService.findOne('users', { email });
    return dbUser ? await toCamelCase<User>(dbUser) : undefined;
  }

  async findActiveAdmins(): Promise<User[]> {
    const dbUsers = await this.knexService
      .knex('users')
      .where({
        role: UserRole.ADMIN,
        is_active: true,
      })
      .select('*');
    return Promise.all(dbUsers.map(async (u) => await toCamelCase<User>(u)));
  }

  async findWithPagination(
    page: number = 1,
    limit: number = 10,
    conditions: Record<string, any> = {},
    orderBy: string = 'created_at',
    direction: 'asc' | 'desc' = 'desc',
  ): Promise<{
    data: User[];
    meta: { total: number; page: number; limit: number };
  }> {
    const query = this.knexService.knex('users');

    Object.keys(conditions).forEach((key) => {
      if (conditions[key] !== undefined) {
        query.where(key, conditions[key]);
      }
    });

    if (conditions.search) {
      query.where((builder) => {
        builder
          .where('email', 'like', `%${conditions.search}%`)
          .orWhere('full_name', 'like', `%${conditions.search}%`);
      });
    }

    const offset = (page - 1) * limit;

    const [count, data] = await Promise.all([
      this.knexService.knex('users').count('* as count').first(),
      query.orderBy(orderBy, direction).limit(limit).offset(offset),
    ]);

    return {
      data: await Promise.all(
        data.map(async (u) => await toCamelCase<User>(u)),
      ),
      meta: {
        total: Number(count?.count || 0),
        page,
        limit,
      },
    };
  }
}
