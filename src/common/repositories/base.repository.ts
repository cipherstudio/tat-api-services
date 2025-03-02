import {
  Repository,
  FindOptionsWhere,
  FindOptionsOrder,
  FindOptionsSelect,
  FindOptionsRelations,
} from 'typeorm';

export interface PaginateOptions {
  page?: number;
  limit?: number;
  searchField?: string;
  searchValue?: string;
  orderBy?: { [key: string]: 'ASC' | 'DESC' };
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
    limit: number;
  };
}

export interface FindAllOptions<T> {
  where?: FindOptionsWhere<T>;
  order?: FindOptionsOrder<T>;
  select?: FindOptionsSelect<T>;
  relations?: FindOptionsRelations<T>;
  withDeleted?: boolean;
}

export class BaseRepository<T> extends Repository<T> {
  async paginate(
    options: PaginateOptions = {},
    findOptions: FindAllOptions<T> = {},
  ): Promise<PaginatedResult<T>> {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    // Build where clause
    let where = findOptions.where || {};
    if (options.searchField && options.searchValue) {
      where = {
        ...where,
        [options.searchField]: options.searchValue,
      };
    }

    // Build order clause
    const order = options.orderBy || findOptions.order || { id: 'DESC' };

    const [data, total] = await this.findAndCount({
      ...findOptions,
      where,
      order: order as FindOptionsOrder<T>,
      skip,
      take: limit,
    });

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

  async findOneByOrFail(where: FindOptionsWhere<T>): Promise<T> {
    const result = await this.findOneBy(where);
    if (!result) {
      throw new Error('Entity not found');
    }
    return result;
  }

  async findWithOptions(options: FindAllOptions<T> = {}): Promise<T[]> {
    return this.find({
      where: options.where,
      order: options.order,
      select: options.select,
      relations: options.relations,
      withDeleted: options.withDeleted,
    });
  }
}
