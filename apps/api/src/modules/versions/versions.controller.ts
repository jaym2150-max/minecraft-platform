import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ForbiddenException,
  Req,
} from '@nestjs/common';
import { VersionsService } from './versions.service';
import { CreateVersionDto } from './dto/create-version.dto';
import { UpdateVersionDto } from './dto/update-version.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ScopesGuard } from '../../common/guards/scopes.guard';
import { Scopes } from '../../common/decorators/scopes.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ProjectsService } from '../projects/projects.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ApiKeyScope } from '@prisma/client';
import { Request } from 'express';
import { QueryVersionsDto } from './dto/query-versions.dto';
import { FilesService } from '../files/files.service';

interface JwtPayload {
  id: string;
  username: string;
  email: string;
  role: string;
}

interface AuthRequest extends Request {
  user: JwtPayload;
}

@Controller('projects/:projectId/versions')
export class VersionsController {
  constructor(
    private readonly versionsService: VersionsService,
    private readonly projectsService: ProjectsService,
    private readonly prisma: PrismaService,
    private readonly filesService: FilesService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, ScopesGuard)
  @Scopes(ApiKeyScope.VERSION_WRITE, ApiKeyScope.PROJECT_WRITE)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('projectId') projectIdOrSlug: string,
    @Body() dto: CreateVersionDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: string,
  ) {
    const project = await this.projectsService.findProjectOr404(projectIdOrSlug, {
      id: userId,
      role: userRole,
    });
    await this.verifyProjectOwnership(project.id, { id: userId, role: userRole });
    const data = await this.versionsService.create(project.id, dto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Version created successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Get()
  @Public()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Param('projectId') projectIdOrSlug: string,
    @Query() query: QueryVersionsDto,
  ) {
    const page = await this.versionsService.findAllByProjectCursor(projectIdOrSlug, {
      cursor: query.cursor,
      limit: query.limit,
      loaders: query.loaders,
      gameVersions: query.gameVersions,
    });
    return {
      statusCode: HttpStatus.OK,
      message: 'Versions retrieved successfully',
      data: page.data,
      meta: { nextCursor: page.nextCursor, hasMore: page.hasMore },
      timestamp: new Date().toISOString(),
    };
  }

  private async verifyProjectOwnership(projectId: string, user: { id: string; role: string }) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { authorId: true },
    });
    if (!project) {
      throw new ForbiddenException('Project not found');
    }
    if (project.authorId !== user.id && !['ADMIN', 'OWNER', 'MODERATOR'].includes(user.role)) {
      throw new ForbiddenException('You can only modify versions on your own projects');
    }
  }
}

@Controller('versions')
export class VersionByIdController {
  constructor(
    private readonly versionsService: VersionsService,
    private readonly prisma: PrismaService,
    private readonly filesService: FilesService,
  ) {}

  @Get()
  @Public()
  @HttpCode(HttpStatus.OK)
  async list(@Query('ids') ids?: string) {
    if (ids) {
      const parsed = ids.split(',').map((s) => s.trim()).filter(Boolean);
      // Cap the list at 200 ids — a 100k-element `?ids=` produces an SQL
      // IN-clause + Prisma array allocation that pegs the worker (B23).
      if (parsed.length > 200) parsed.length = 200;
      const data = await this.versionsService.findByIds(parsed);
      return {
        statusCode: HttpStatus.OK,
        message: 'Versions retrieved successfully',
        data,
        timestamp: new Date().toISOString(),
      };
    }
    // No filter: return empty rather than 404; clients use ?ids= for bulk.
    return {
      statusCode: HttpStatus.OK,
      message: 'Provide ?ids=A,B,C to fetch specific versions',
      data: [],
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':id')
  @Public()
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    const data = await this.versionsService.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Version retrieved successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, ScopesGuard)
  @Scopes(ApiKeyScope.VERSION_WRITE, ApiKeyScope.PROJECT_WRITE)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateVersionDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: string,
  ) {
    await this.verifyVersionOwnership(id, { id: userId, role: userRole });
    const data = await this.versionsService.update(id, dto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Version updated successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, ScopesGuard)
  @Scopes(ApiKeyScope.VERSION_WRITE, ApiKeyScope.DELETE)
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string, @CurrentUser('id') userId: string, @CurrentUser('role') userRole: string) {
    await this.verifyVersionOwnership(id, { id: userId, role: userRole });
    await this.versionsService.remove(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Version deleted successfully',
      data: null,
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':id/download')
  @Public()
  async download(@Param('id') id: string, @Req() req: AuthRequest) {
    const ip = (req.headers['x-forwarded-for'] as string) ?? req.ip;
    const userAgent = req.headers['user-agent'];
    const userId = req.user?.id;
    // SECURITY: the service returns the raw permanent S3/CDN `fileUrl` — that
    // URL, once leaked, hotlinks forever and bypasses any later access
    // revocation. Convert it to a short-lived pre-signed URL (or a CDN URL if
    // one is configured) before returning it to the client so a one-off leak
    // of the response body can't grant permanent access. Same pattern as
    // `files.service.getDownloadUrl`.
    const { fileUrl, hash } = await this.versionsService.incrementDownloads(
      id,
      ip,
      userAgent,
      userId,
    );
    const objectKey = this.filesService.getObjectKeyFromUrl(fileUrl);
    const downloadUrl = await this.filesService.getDownloadUrl(objectKey);
    return {
      statusCode: HttpStatus.OK,
      message: 'Download URL retrieved successfully',
      data: { url: downloadUrl, hash, hashAlgorithm: 'sha256' },
      timestamp: new Date().toISOString(),
    };
  }

  private async verifyVersionOwnership(versionId: string, user: { id: string; role: string }) {
    const version = await this.prisma.projectVersion.findUnique({
      where: { id: versionId },
      select: { projectId: true },
    });
    if (!version) {
      throw new ForbiddenException('Version not found');
    }
    const project = await this.prisma.project.findUnique({
      where: { id: version.projectId },
      select: { authorId: true },
    });
    if (!project || (project.authorId !== user.id && !['ADMIN', 'OWNER', 'MODERATOR'].includes(user.role))) {
      throw new ForbiddenException('You can only modify versions on your own projects');
    }
  }
}
