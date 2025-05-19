import { Injectable } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { KnexBaseRepository } from '../../../common/repositories/knex-base.repository';
import { KnexService } from '../../../database/knex-service/knex.service';
import { toCamelCase } from '../../../common/utils/case-mapping';

@Injectable()
export class UsersRepository extends KnexBaseRepository<User> {
  constructor(knexService: KnexService) {
    super(knexService, 'users');
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const dbUser = await this.findOne({ email });
    return dbUser ? await toCamelCase<User>(dbUser) : undefined;
  }

  async findActiveUsers(page: number = 1, limit: number = 10) {
    const result = await this.findWithPagination(
      page,
      limit,
      { is_active: true },
      'created_at',
      'desc',
    );
    return {
      ...result,
      data: await Promise.all(
        result.data.map(async (u) => await toCamelCase<User>(u)),
      ),
    };
  }

  async searchUsers(query: string, page: number = 1, limit: number = 10) {
    const dbUsers = await this.knexService
      .knex('users')
      .where('email', 'like', `%${query}%`)
      .orWhere('full_name', 'like', `%${query}%`)
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset((page - 1) * limit);

    const count = await this.knexService
      .knex('users')
      .where('email', 'like', `%${query}%`)
      .orWhere('full_name', 'like', `%${query}%`)
      .count('* as count')
      .first();

    return {
      data: await Promise.all(
        dbUsers.map(async (u) => await toCamelCase<User>(u)),
      ),
      meta: {
        total: Number(count?.count || 0),
        page,
        limit,
      },
    };
  }
}
