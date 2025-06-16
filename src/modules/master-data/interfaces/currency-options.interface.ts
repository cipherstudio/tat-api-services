import {
  BasePaginationOptions,
  BaseFilterOptions,
  BaseIncludeOptions,
} from '../../../common/interfaces/query-options.interface';

export interface CurrencyFilterOptions extends BaseFilterOptions {
  currencyTh?: string;
  currencyCodeTh?: string;
  currencyEn?: string;
  currencyCodeEn?: string;
}

export interface CurrencyPaginationOptions extends BasePaginationOptions {}

export interface CurrencyIncludeOptions extends BaseIncludeOptions {}

export interface CurrencyQueryOptions {
  page?: number;
  limit?: number;
  orderBy?:
    | 'currencyTh'
    | 'currencyCodeTh'
    | 'currencyEn'
    | 'currencyCodeEn'
    | 'id';
  orderDir?: 'ASC' | 'DESC';
  currencyTh?: string;
  currencyCodeTh?: string;
  currencyEn?: string;
  currencyCodeEn?: string;
  searchTerm?: string;
}
