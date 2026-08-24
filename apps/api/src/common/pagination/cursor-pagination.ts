import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CursorPaginationDto {
  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

export interface PaginateCursorOptions {
  take: number;
  cursor?: string | null;
  orderBy: unknown;
  where?: unknown;
  prismaDelegate: {
    findMany: (args: {
      where?: unknown;
      orderBy?: unknown;
      take: number;
      cursor?: { id: string } | { id: string }[];
      skip?: number;
      include?: unknown;
      select?: unknown;
    }) => Promise<Array<{ id: string } & Record<string, unknown>>>;
  };
}

export interface CursorPage<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

export function encodeCursor(value: string | null | undefined): string | null {
  if (!value) return null;
  return Buffer.from(value, 'utf8').toString('base64url');
}

export function decodeCursor(cursor: string | null | undefined): string | null {
  if (!cursor) return null;
  try {
    return Buffer.from(cursor, 'base64url').toString('utf8');
  } catch {
    return null;
  }
}

/**
 * Cursor-based paginator. `take` is the page size; we always over-fetch by 1
 * so we know whether another page exists without an extra count query.
 * The opaque cursor encodes the last-seen row's primary key; pass it back as
 * `cursor` to get the next page.
 *
 * The `prismaDelegate.findMany` callback receives the raw args from this
 * helper (where / orderBy / take / cursor / skip). The caller is expected to
 * forward them to the actual Prisma delegate and add any includes/selects.
 * Because the args are typed `unknown` at this layer, callers must cast
 * internally — see projects.service.ts findAllCursor for the pattern.
 */
export async function paginateCursor<T extends { id: string }>(
  opts: PaginateCursorOptions,
): Promise<CursorPage<T>> {
  const take = Math.max(1, Math.min(100, opts.take));
  const decoded = decodeCursor(opts.cursor);
  const rows = (await opts.prismaDelegate.findMany({
    where: opts.where,
    orderBy: opts.orderBy,
    take: take + 1,
    cursor: decoded ? { id: decoded } : undefined,
    skip: decoded ? 1 : undefined,
  })) as T[];

  const hasMore = rows.length > take;
  const data = hasMore ? rows.slice(0, take) : rows;
  const last = data[data.length - 1];
  const nextCursor = hasMore && last ? encodeCursor(last.id) : null;

  return { data, nextCursor, hasMore };
}
