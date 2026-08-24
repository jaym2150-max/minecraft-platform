import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { VersionsService } from './versions.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ScopesGuard } from '../../common/guards/scopes.guard';
import { Scopes } from '../../common/decorators/scopes.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { ApiKeyScope } from '@prisma/client';
import { IsArray, IsEnum, IsOptional, IsString, ArrayMaxSize } from 'class-validator';

class BulkLookupDto {
  @IsArray()
  @ArrayMaxSize(200)
  @IsString({ each: true })
  hashes!: string[];

  @IsOptional()
  @IsEnum(['sha256', 'sha1', 'sha512'])
  algorithm?: 'sha256' | 'sha1' | 'sha512';
}

/**
 * Modrinth-compatible hash-based version-file endpoints. These power launcher
 * integrations: a launcher uploads a file, hashes it, then asks the API
 * "what is this file?" via the hash.
 *
 * Endpoints:
 *  - GET  /version-files/:hash                 lookup by content hash
 *  - GET  /version-files/latest?hash=...       latest matching version
 *  - POST /version-files/bulk                  bulk lookup, body { hashes, algorithm }
 *  - GET  /versions/hash/:hash                 legacy alias
 *  - GET  /versions/latest?hash=...            legacy alias
 */
@Controller('version-files')
export class VersionFilesController {
  constructor(private readonly versionsService: VersionsService) {}

  @Get('latest')
  @Public()
  @HttpCode(HttpStatus.OK)
  async getLatest(
    @Query('hash') hash: string,
    @Query('loaders') loaders?: string,
    @Query('gameVersions') gameVersions?: string,
  ) {
    if (!hash) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Query parameter "hash" is required',
        data: null,
        timestamp: new Date().toISOString(),
      };
    }
    const data = await this.versionsService.getLatestByHash(
      hash,
      loaders ? loaders.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
      gameVersions ? gameVersions.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Latest matching version retrieved successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':hash')
  @Public()
  @HttpCode(HttpStatus.OK)
  async getByHash(
    @Param('hash') hash: string,
    @Query('algorithm') algorithm?: string,
  ) {
    const data = await this.versionsService.getByHash(hash, algorithm ?? 'sha256');
    return {
      statusCode: HttpStatus.OK,
      message: 'Version retrieved successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('bulk')
  @UseGuards(JwtAuthGuard, ScopesGuard)
  @Scopes(ApiKeyScope.VERSION_READ, ApiKeyScope.PROJECT_READ, ApiKeyScope.READ)
  @HttpCode(HttpStatus.OK)
  async bulk(@Body() dto: BulkLookupDto) {
    const data = await this.versionsService.getBulkByHashes(
      dto.hashes,
      dto.algorithm ?? 'sha256',
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Bulk lookup completed',
      data,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Legacy aliases under `/versions/*` to match the older Modrinth API
 * surface. Same handlers, different paths. The `latest` and `hash/:hash`
 * routes are defined BEFORE the `:id` catch-all on VersionByIdController,
 * so we give these aliases explicit paths that can't be shadowed.
 */
@Controller('versions')
export class VersionsHashCompatController {
  constructor(private readonly versionsService: VersionsService) {}

  @Get('hash-by-id/:hash')
  @Public()
  @HttpCode(HttpStatus.OK)
  async getByHash(
    @Param('hash') hash: string,
    @Query('algorithm') algorithm?: string,
  ) {
    const data = await this.versionsService.getByHash(hash, algorithm ?? 'sha256');
    return {
      statusCode: HttpStatus.OK,
      message: 'Version retrieved successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('latest-by-hash')
  @Public()
  @HttpCode(HttpStatus.OK)
  async getLatest(
    @Query('hash') hash: string,
    @Query('loaders') loaders?: string,
    @Query('gameVersions') gameVersions?: string,
  ) {
    if (!hash) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Query parameter "hash" is required',
        data: null,
        timestamp: new Date().toISOString(),
      };
    }
    const data = await this.versionsService.getLatestByHash(
      hash,
      loaders ? loaders.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
      gameVersions ? gameVersions.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Latest matching version retrieved successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }
}
