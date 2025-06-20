import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from './repositories/user.repository';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RedisCacheService } from '../cache/redis-cache.service';
import * as bcrypt from 'bcrypt';
import { omitFields } from '../../common/utils/omit-fields';
import { Employee } from '@modules/dataviews/entities/employee.entity';
import { ViewPosition4ot } from '@modules/dataviews/entities/view-position-4ot.entity';
import { OpLevelSalR } from '@modules/dataviews/entities/op-level-sal-r.entity';
import { OpMasterT } from '@modules/dataviews/entities/op-master-t.entity';

const SENSITIVE_FIELDS = [
  'password',
  'refreshToken',
  'passwordResetToken',
  'passwordResetExpires',
];

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly cacheService: RedisCacheService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = {
      ...createUserDto,
      loginAttempts: 0,
      isActive: true,
    };

    // Hash password if it's not already hashed
    if (createUserDto.password && !createUserDto.password.startsWith('$2b$')) {
      user.password = await bcrypt.hash(createUserDto.password, 10);
    }

    return this.userRepository.create(user);
  }

  async findById(id: number): Promise<User> {
    // Try to get from cache first
    const cacheKey = `user:${id}`;
    const cached = await this.cacheService.get<User>(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch from database
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Cache the result
    await this.cacheService.set(cacheKey, user, 3600); // Cache for 1 hour
    return user;
  }

  async findByIdPublic(id: number): Promise<Partial<User>> {
    const user = await this.findById(id);
    return omitFields(user, SENSITIVE_FIELDS);
  }

  async findByEmail(
    email: string,
  ): Promise<
    (User & (Employee & ViewPosition4ot & OpLevelSalR & OpMasterT)) | undefined
  > {
    return this.userRepository.findByEmail(email);
  }

  async findByResetToken(token: string): Promise<User | undefined> {
    return this.userRepository.findOne({ password_reset_token: token });
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
  ): Promise<{ data: Partial<User>[]; meta: any }> {
    const conditions: Record<string, any> = {};

    if (search) {
      conditions.search = search;
    }

    const result = await this.userRepository.findWithPagination(
      page,
      limit,
      conditions,
    );
    return {
      ...result,
      data: result.data.map((u) => omitFields(u, SENSITIVE_FIELDS)),
    };
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<Partial<User>> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Hash password if it's being updated and not already hashed
    if (updateUserDto.password && !updateUserDto.password.startsWith('$2b$')) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updatedUser = { ...user, ...updateUserDto };
    await this.userRepository.update(id, updatedUser);

    // Invalidate cache
    await this.cacheService.del(`user:${id}`);

    return this.findByIdPublic(id);
  }

  async incrementLoginAttempts(id: number): Promise<void> {
    const user = await this.findById(id);
    if (!user) {
      return;
    }

    const loginAttempts = user.loginAttempts + 1;
    await this.userRepository.update(id, { loginAttempts });

    // Invalidate cache
    await this.cacheService.del(`user:${id}`);
  }

  async resetLoginAttempts(id: number): Promise<void> {
    await this.userRepository.update(id, { loginAttempts: 0 });

    // Invalidate cache
    await this.cacheService.del(`user:${id}`);
  }

  async lockAccount(id: number, lockUntil: Date): Promise<void> {
    await this.userRepository.update(id, { lockUntil });

    // Invalidate cache
    await this.cacheService.del(`user:${id}`);
  }

  async remove(id: number): Promise<void> {
    const result = await this.userRepository.delete(id);
    if (result === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Invalidate cache
    await this.cacheService.del(`user:${id}`);
  }

  async getUserForLogin(id: number): Promise<Partial<User>> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    // Only hide password and refreshToken for login
    return omitFields(user, ['password', 'refreshToken']);
  }

  async getUserForResetPassword(id: number): Promise<Partial<User>> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    // Hide password, refreshToken, passwordResetToken, passwordResetExpires
    return omitFields(user, SENSITIVE_FIELDS);
  }

  async getMe(userId: number) {
    return this.userRepository.findByIdWithEmployee(userId);
  }
}
