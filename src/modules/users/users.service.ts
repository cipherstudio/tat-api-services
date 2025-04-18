import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryOptions } from './interfaces/user-options.interface';
import { PaginatedResult } from '../../common/interfaces/pagination.interface';
import { RedisCacheService } from '../cache/redis-cache.service';
import { UserRepository } from './repositories/user.repository';

@Injectable()
export class UsersService {
  private readonly CACHE_PREFIX = 'user';
  private readonly CACHE_TTL = 3600; // 1 hour in seconds

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly customUserRepository: UserRepository,
    private readonly cacheService: RedisCacheService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create({
      ...createUserDto,
      role: createUserDto.role || UserRole.USER,
    });

    // Use our custom repository for saving
    const savedUser = await this.customUserRepository.save(user);

    // Cache the new user
    await this.cacheService.set(
      this.cacheService.generateKey(this.CACHE_PREFIX, savedUser.id),
      savedUser,
      this.CACHE_TTL,
    );

    // Invalidate the users list cache
    await this.cacheService.del(
      this.cacheService.generateListKey(this.CACHE_PREFIX),
    );

    return savedUser;
  }

  async findAll(
    queryOptions?: UserQueryOptions,
  ): Promise<PaginatedResult<User>> {
    // Generate cache key based on query parameters
    const cacheKey = this.cacheService.generateListKey(this.CACHE_PREFIX);

    // Try to get from cache first
    const cachedResult =
      await this.cacheService.get<PaginatedResult<User>>(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    const {
      page = 1,
      limit = 10,
      orderBy = 'createdAt',
      orderDir = 'DESC',
      includeInactive = false,
      role,
      email,
      isActive = includeInactive ? undefined : true,
    } = queryOptions || {};

    // Use our Oracle-optimized repository for pagination
    const filters: Partial<User> = {
      email,
      role: role as UserRole,
      isActive,
    };

    const result = await this.customUserRepository.findWithPagination(
      page,
      limit,
      orderBy,
      orderDir as 'ASC' | 'DESC',
      filters,
    );

    // Cache the result
    await this.cacheService.set(cacheKey, result, this.CACHE_TTL);

    return result;
  }

  async findById(id: number): Promise<User> {
    // Try to get from cache first
    const cacheKey = this.cacheService.generateKey(this.CACHE_PREFIX, id);
    const cachedUser = await this.cacheService.get<User>(cacheKey);
    if (cachedUser) {
      return cachedUser;
    }

    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Cache the user
    await this.cacheService.set(cacheKey, user, this.CACHE_TTL);

    return user;
  }

  async findByEmail(email: string): Promise<User> {
    // Try to get from cache first
    const cacheKey = this.cacheService.generateKey(
      this.CACHE_PREFIX,
      `email:${email}`,
    );
    const cachedUser = await this.cacheService.get<User>(cacheKey);
    if (cachedUser) {
      return cachedUser;
    }

    const user = await this.userRepository.findOne({ where: { email } });
    if (user) {
      // Cache the user
      await this.cacheService.set(cacheKey, user, this.CACHE_TTL);
    }

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const updateData: Partial<User> = {
      ...updateUserDto,
      role: updateUserDto.role as UserRole,
    };

    // Get the existing user
    const existingUser = await this.findById(id);
    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Merge update data
    const updatedUser = {
      ...existingUser,
      ...updateData,
    };

    // Use the custom repository
    await this.customUserRepository.save(updatedUser);

    // Update cache
    const cacheKey = this.cacheService.generateKey(this.CACHE_PREFIX, id);
    await this.cacheService.set(cacheKey, updatedUser, this.CACHE_TTL);

    // Invalidate email cache if email was updated
    if (updateUserDto.email) {
      await this.cacheService.del(
        this.cacheService.generateKey(
          this.CACHE_PREFIX,
          `email:${updateUserDto.email}`,
        ),
      );
    }

    // Invalidate the users list cache
    await this.cacheService.del(
      this.cacheService.generateListKey(this.CACHE_PREFIX),
    );

    return updatedUser;
  }

  async remove(id: number): Promise<void> {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Remove from cache
    await this.cacheService.del(
      this.cacheService.generateKey(this.CACHE_PREFIX, id),
    );
    // Invalidate the users list cache
    await this.cacheService.del(
      this.cacheService.generateListKey(this.CACHE_PREFIX),
    );
  }
}
