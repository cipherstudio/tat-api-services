import { Injectable } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { KnexBaseRepository } from '../../../common/repositories/knex-base.repository';
import { KnexService } from '../../../database/knex-service/knex.service';

@Injectable()
export class UsersRepository extends KnexBaseRepository<User> {
  constructor(knexService: KnexService) {
    super(knexService, 'users');
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.findOne({ email });
  }

  async findActiveUsers(page: number = 1, limit: number = 10) {
    return this.findWithPagination(
      page,
      limit,
      { is_active: true },
      'created_at',
      'desc',
    );
  }

  async searchUsers(query: string, page: number = 1, limit: number = 10) {
    return this.knexService
      .knex('users')
      .where('email', 'like', `%${query}%`)
      .orWhere('full_name', 'like', `%${query}%`)
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset((page - 1) * limit)
      .then(async (data) => {
        const count = await this.knexService
          .knex('users')
          .where('email', 'like', `%${query}%`)
          .orWhere('full_name', 'like', `%${query}%`)
          .count('* as count')
          .first();

        return {
          data,
          meta: {
            total: Number(count?.count || 0),
            page,
            limit,
          },
        };
      });
  }
}
