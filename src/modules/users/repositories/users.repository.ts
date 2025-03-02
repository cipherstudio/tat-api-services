import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { User } from '../entities/user.entity';
import {
  BaseRepository,
  PaginatedResult,
  PaginateOptions,
} from '../../../common/repositories/base.repository';

@Injectable()
export class UsersRepository extends BaseRepository<User> {
  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ where: { email } });
  }

  async findActiveUsers(
    options: PaginateOptions = {},
  ): Promise<PaginatedResult<User>> {
    return this.paginate(options, {
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async searchUsers(
    query: string,
    options: PaginateOptions = {},
  ): Promise<PaginatedResult<User>> {
    const queryBuilder = this.createQueryBuilder('user');

    queryBuilder
      .where('user.email LIKE :query OR user.fullName LIKE :query', {
        query: `%${query}%`,
      })
      .orderBy('user.createdAt', 'DESC');

    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();
    const lastPage = Math.ceil(total / limit);

    return {
      data,
      meta: {
        total,
        page,
        lastPage,
        limit,
      },
    };
  }
}
