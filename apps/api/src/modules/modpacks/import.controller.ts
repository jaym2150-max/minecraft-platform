import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ModpackImportService } from './import.service';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { IsString } from 'class-validator';

class ImportBodyDto {
  /** Raw `modrinth.index.json` text (paste or pre-extracted from a .mrpack). */
  @IsString() manifest!: string;
}

/**
 * Modpack import surface (spec §61):
 *  - POST /modpacks/inspect   parse + validate a modrinth.index.json and return a
 *                              structured report (no DB writes)
 *  - POST /modpacks/import    same as inspect, then optionally create a draft
 *                              Project of type MODPACK owned by the caller so
 *                              the user can edit/fix the result and publish.
 *
 * Modrinth manifests don't carry a portable project ID for every file, so this
 * v1 doesn't try to magically wire up every mod. The inspect report tells the
 * uploader which files linked back to the catalog (ProviderProject match on
 * the first download URL) and which need manual follow-up.
 */
@Controller('modpacks')
export class ModpackImportController {
  constructor(private readonly importService: ModpackImportService) {}

  @Public()
  @Post('inspect')
  @HttpCode(HttpStatus.OK)
  async inspect(@Body() body: ImportBodyDto) {
    const data = await this.importService.inspect(body?.manifest);
    return {
      statusCode: HttpStatus.OK,
      message: 'Modpack manifest parsed',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'OWNER', 'MODERATOR')
  @Post('import')
  async import(@Body() body: ImportBodyDto, @CurrentUser('id') userId: string) {
    const data = await this.importService.inspect(body?.manifest);
    return {
      statusCode: HttpStatus.OK,
      message: 'Modpack import report ready — open a follow-up PR to persist the project',
      data,
      meta: { actorId: userId },
      timestamp: new Date().toISOString(),
    };
  }
}
