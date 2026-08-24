import { IsOptional, IsString, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { ProjectStatus } from '@prisma/client';

/**
 * Split a querystring value (CSV string or already-array) into a trimmed,
 * de-duplicated string[]. Powers the Modrinth-style multi-select facet sidebar.
 *
 * NOTE: class-transformer >= 0.3 passes a params OBJECT ({ value, key, obj })
 * to @Transform callbacks, NOT the raw value — so destructure `value` here.
 */
function toArray({ value }: { value: unknown }): string[] {
  if (value === undefined || value === null || value === '') return [];
  const raw = Array.isArray(value) ? value : String(value).split(',');
  return Array.from(new Set(raw.map((v) => String(v).trim()).filter(Boolean)));
}

/**
 * Query params for `GET /projects`. Accepts Modrinth-style multi-select
 * facets as comma-separated arrays (e.g. `?loaders=FABRIC,QUILT&gameVersions=1.20.1`)
 * while keeping the singular aliases (`category`, `loader`, `projectType`,
 * `gameVersion`, `license`) for backward compatibility with older clients.
 *
 * The service merges singular + plural into one array and matches ids or slugs
 * where appropriate, so the facet sidebar (which sends category ids) and the
 * legacy SDK (which sends slugs) both work.
 */
export class QueryProjectsDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string;

  /** Project categories — accepts ids OR slugs, CSV or repeated. */
  @IsOptional()
  @Transform(toArray)
  categories?: string[];

  /** Singular alias kept for backward compatibility (id or slug). */
  @IsOptional()
  @IsString()
  category?: string;

  /** Loader enum values (FABRIC, FORGE, …), CSV or repeated. */
  @IsOptional()
  @Transform(toArray)
  loaders?: string[];

  @IsOptional()
  @IsString()
  loader?: string;

  /** ProjectType enum values, CSV or repeated. */
  @IsOptional()
  @Transform(toArray)
  projectTypes?: string[];

  @IsOptional()
  @IsString()
  projectType?: string;

  /** Minecraft game version strings (eg. "1.20.1"), CSV or repeated. */
  @IsOptional()
  @Transform(toArray)
  gameVersions?: string[];

  /** Singular alias kept for backward compatibility. */
  @IsOptional()
  @IsString()
  gameVersion?: string;

  /** License ids OR shortIds, CSV or repeated. */
  @IsOptional()
  @Transform(toArray)
  licenses?: string[];

  @IsOptional()
  @IsString()
  license?: string;

  /** Backwards-compatible single license UUID (folded into `licenses`). */
  @IsOptional()
  @IsString()
  licenseId?: string;

  /** Side filter: "client" | "server", CSV or repeated. */
  @IsOptional()
  @Transform(toArray)
  environments?: string[];

  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @IsOptional()
  @IsString()
  author?: string;

  /** Bulk lookup — comma-separated ids/slugs. */
  @IsOptional()
  @IsString()
  ids?: string;

  /**
   * Opaque cursor for infinite scroll. The route treats this as the next
   * page number under the hood (see ProjectsService.findAll), so clients get
   * `total` + `nextCursor` + `hasMore` in a single round-trip.
   */
  @IsOptional()
  @IsString()
  cursor?: string;
}
