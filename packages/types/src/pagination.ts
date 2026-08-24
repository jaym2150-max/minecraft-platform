export interface CursorPaginated<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface OffsetPaginatedMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface OffsetPaginated<T> {
  data: T[];
  meta: OffsetPaginatedMeta;
}
