import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { User } from '../entities/user.entity';
import {
  BaseRepository,
  PaginatedResult,
  PaginateOptions,
} from '../../../common/repositories/base.repository';
import { OracleService } from '../../../database/oracle.service';

@Injectable()
export class UsersRepository extends BaseRepository<User> {
  constructor(
    private dataSource: DataSource,
    protected oracleService: OracleService,
  ) {
    super(User, dataSource);
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
    // Use the paginate method with a custom search
    return this.paginate(
      {
        ...options,
        searchField: 'email',
        searchValue: query,
        orderBy: { createdAt: 'DESC' },
      },
      {},
    );
  }
}
