import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Res,
  Header,
} from '@nestjs/common';
import { Response } from 'express';
import { ModpacksService } from './modpacks.service';
import { ResolverService } from './resolver.service';
import { Public } from '../../common/decorators/public.decorator';

/**
 * Read-only modpack endpoints. A modpack's `.mrpack` manifest is derived on
 * demand from its stored dependencies + per-version loader rows, so there's no
 * "build a zip" step at read time — launchers can fetch `modrinth.index.json`
 * directly and download the referenced files.
 *
 * Routes:
 *  - GET /projects/:slug/modpack/manifest               latest approved version
 *  - GET /projects/:slug/versions/:versionId/modpack/manifest  specific version
 *  - GET /projects/:slug/modpack/manifest.json           pretty-printed download
 *  - GET /projects/:slug/modpack/server-pack             streamed zip (server pack)
 *  - GET /projects/:slug/versions/:versionId/modpack/server-pack  per version
 *  - GET /projects/:slug/compatibility                   loader×game-version matrix
 */
@Public()
@Controller('projects')
export class ModpacksController {
  constructor(
    private readonly modpacksService: ModpacksService,
    private readonly resolver: ResolverService,
  ) {}

  @Public()
  @Post(':slug/modpack/resolve')
  @HttpCode(HttpStatus.OK)
  async resolveModpack(
    @Param('slug') slug: string,
    @Body() body: { gameVersion?: string; loaderType?: string },
  ) {
    const data = await this.resolver.resolve([slug], {
      gameVersion: body?.gameVersion,
      loaderType: body?.loaderType,
    });
    return {
      statusCode: HttpStatus.OK,
      message: 'Modpack resolved',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Post('modpacks/preview')
  @HttpCode(HttpStatus.OK)
  async previewModpack(
    @Body() body: { seeds: string[]; gameVersion?: string; loaderType?: string },
  ) {
    const data = await this.resolver.resolve(body?.seeds ?? [], {
      gameVersion: body?.gameVersion,
      loaderType: body?.loaderType,
    });
    return {
      statusCode: HttpStatus.OK,
      message: 'Preview resolved',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':slug/modpack/manifest')
  @HttpCode(HttpStatus.OK)
  async getManifest(@Param('slug') slug: string) {
    const data = await this.modpacksService.buildManifest(slug);
    return {
      statusCode: HttpStatus.OK,
      message: 'Modpack manifest retrieved successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':slug/versions/:versionId/modpack/manifest')
  @HttpCode(HttpStatus.OK)
  async getManifestForVersion(@Param('slug') slug: string, @Param('versionId') versionId: string) {
    const data = await this.modpacksService.buildManifest(slug, versionId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Modpack manifest retrieved successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Downloadable `modrinth.index.json` — sets a Content-Disposition attachment
   * header so browsers save it rather than render it. The body is identical to
   * the manifest route above.
   */
  @Get(':slug/modpack/manifest.json')
  @Header('Content-Type', 'application/json; charset=utf-8')
  async downloadManifest(@Param('slug') slug: string, @Res() res: Response) {
    const data = await this.modpacksService.buildManifest(slug);
    const filename = `modrinth.index.json`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(JSON.stringify(data, null, 2));
  }

  /**
   * Stream a downloadable server-pack `.zip` for the modpack's latest approved
   * version — manifest + pre-resolved `mods/` folder + run-script stubs. The
   * service streams straight into the response; we pass `@Res()` bare (no
   * `passthrough`) so Nest skips the response interceptor for binary.
   */
  @Get(':slug/modpack/server-pack')
  async getServerPack(@Param('slug') slug: string, @Res() res: Response) {
    await this.modpacksService.streamServerPack(slug, undefined, res);
  }

  /** Per-version server pack — same as above pinned to a specific version. */
  @Get(':slug/versions/:versionId/modpack/server-pack')
  async getServerPackForVersion(
    @Param('slug') slug: string,
    @Param('versionId') versionId: string,
    @Res() res: Response,
  ) {
    await this.modpacksService.streamServerPack(slug, versionId, res);
  }

  @Get(':slug/compatibility')
  @HttpCode(HttpStatus.OK)
  async getCompatibility(@Param('slug') slug: string) {
    const data = await this.modpacksService.getCompatibility(slug);
    return {
      statusCode: HttpStatus.OK,
      message: 'Project compatibility matrix retrieved successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Download the modpack as a `.mrpack` archive — importable directly into
   * the Modrinth App / Prism Launcher. Small zip: manifest + empty overrides
   * (launchers fetch each file from its CDN source at import time).
   */
  @Get(':slug/modpack/download')
  async downloadMrpack(@Param('slug') slug: string, @Res() res: Response) {
    await this.modpacksService.streamMrpack(slug, undefined, res);
  }

  @Get(':slug/versions/:versionId/modpack/download')
  async downloadMrpackVersion(
    @Param('slug') slug: string,
    @Param('versionId') versionId: string,
    @Res() res: Response,
  ) {
    await this.modpacksService.streamMrpack(slug, versionId, res);
  }
}
