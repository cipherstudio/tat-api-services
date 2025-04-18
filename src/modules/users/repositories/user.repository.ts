import { Injectable } from '@nestjs/common';
import { User, UserRole } from '../entities/user.entity';
import { KnexBaseRepository } from '../../../common/repositories/knex-base.repository';
import { KnexService } from '../../../database/knex-service/knex.service';

@Injectable()
export class UserRepository extends KnexBaseRepository<User> {
  constructor(knexService: KnexService) {
    super(knexService, 'users');
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.knexService.findOne('users', { email });
  }

  // Example of a custom method using Knex directly
  async findActiveAdmins(): Promise<User[]> {
    return this.knexService
      .knex('users')
      .where({
        role: UserRole.ADMIN,
        is_active: true,
      })
      .select('*');
    }

  // Override the base method to add custom filtering
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

    // Apply standard conditions
    Object.keys(conditions).forEach((key) => {
      if (conditions[key] !== undefined) {
        query.where(key, conditions[key]);
      }
    });

    // Apply special filter if it exists
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
      data,
      meta: {
        total: Number(count?.count || 0),
        page,
        limit,
      },
    };
  }
}
