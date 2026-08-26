import { IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { CursorPaginationDto } from '../../../common/dto/cursor-pagination.dto';

/** Split a CSV / repeated query value into a trimmed string[]. */
function toArray(value: unknown): string[] {
  if (value === undefined || value === null || value === '') return [];
  if (Array.isArray(value)) {
    return Array.from(new Set(value.map((v) => String(v).trim()).filter(Boolean)));
  }
  return Array.from(
    new Set(
      String(value)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    ),
  );
}

/**
 * Query params for the per-project version list
 * (`GET /projects/:projectId/versions`). Mirrors Modrinth's
 * `/mod/:slug/versions?l=Fabric&g=1.20.1` so launchers can fetch just the
 * files relevant to a loader / game-version combination.
 */
export class QueryVersionsDto extends CursorPaginationDto {
  /** Loader enum values (FABRIC, FORGE, …), CSV or repeated. */
  @IsOptional()
  @Transform(toArray)
  loaders?: string[];

  /** Minecraft game version strings (eg. "1.20.1"), CSV or repeated. */
  @IsOptional()
  @Transform(toArray)
  gameVersions?: string[];
}
