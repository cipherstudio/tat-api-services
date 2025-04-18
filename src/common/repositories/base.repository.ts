/**
 * @deprecated This file is kept for backward compatibility.
 * Please use KnexBaseRepository for new code.
 */

import { KnexBaseRepository } from './knex-base.repository';

// Export interfaces for backward compatibility
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

export interface FindAllOptions {
  where?: Record<string, any>;
  order?: Record<string, 'ASC' | 'DESC'>;
  select?: string[];
  relations?: string[];
  withDeleted?: boolean;
}

// Export the KnexBaseRepository as BaseRepository for backward compatibility
export { KnexBaseRepository as BaseRepository };
