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
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { DependenciesService } from '../dependencies/dependencies.service';
import { TeamsService } from '../teams/teams.service';
import { FollowsService } from './follows.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { QueryProjectsDto } from './dto/query-projects.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ScopesGuard } from '../../common/guards/scopes.guard';
import { Scopes } from '../../common/decorators/scopes.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { ApiKeyScope } from '@prisma/client';

@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly dependenciesService: DependenciesService,
    private readonly teamsService: TeamsService,
    private readonly followsService: FollowsService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, ScopesGuard)
  @Scopes(ApiKeyScope.PROJECT_WRITE, ApiKeyScope.WRITE)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateProjectDto, @CurrentUser('id') userId: string) {
    const data = await this.projectsService.create(dto, userId);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Project created successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@Query() query: QueryProjectsDto) {
    // Modrinth-compatible bulk lookup: ?ids=A,B,C returns just the array.
    if (query.ids) {
      const ids = String(query.ids)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      // Cap the list at 200 ids — a 100k-element `?ids=` produces an
      // SQL IN-clause + Prisma array allocation that pegs the worker.
      // 200 matches the BulkLookupDto cap used elsewhere (B23).
      if (ids.length > 200) {
        ids.length = 200;
      }
      const data = await this.projectsService.findByIds(ids);
      return {
        statusCode: HttpStatus.OK,
        message: 'Projects retrieved successfully',
        data,
        timestamp: new Date().toISOString(),
      };
    }

    const { data, meta } = await this.projectsService.findAll(query);
    return {
      statusCode: HttpStatus.OK,
      message: 'Projects retrieved successfully',
      data,
      meta,
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Get('trending')
  @HttpCode(HttpStatus.OK)
  async getTrending(@Query('period') period?: string, @Query('limit') limit?: string) {
    const data = await this.projectsService.getTrending(
      period ?? 'week',
      Math.min(Math.max(parseInt(limit ?? '20', 10) || 20, 1), 50),
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Trending projects retrieved successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Get('facets/loaders')
  @HttpCode(HttpStatus.OK)
  async getLoaderFacets() {
    const data = await this.projectsService.getLoaderVersionCompatibility();
    return {
      statusCode: HttpStatus.OK,
      message: 'Loader / version compatibility retrieved successfully',
      data: data.loaders,
      meta: { total: data.total },
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Get(':slug')
  @HttpCode(HttpStatus.OK)
  async findBySlug(
    @Param('slug') slug: string,
    @CurrentUser('id') userId?: string,
    @CurrentUser('role') userRole?: string,
  ) {
    const viewer = userId ? { id: userId, role: userRole ?? 'USER' } : undefined;
    const data = await this.projectsService.findByIdOrSlug(slug, { viewer });
    return {
      statusCode: HttpStatus.OK,
      message: 'Project retrieved successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Get(':slug/dependencies')
  @HttpCode(HttpStatus.OK)
  async getDependencies(
    @Param('slug') slug: string,
    @CurrentUser('id') userId?: string,
    @CurrentUser('role') userRole?: string,
  ) {
    const viewer = userId ? { id: userId, role: userRole ?? 'USER' } : undefined;
    const project = await this.projectsService.findProjectOr404(slug, viewer);
    const data = await this.dependenciesService.findByProject(project.id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Dependencies retrieved successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Get(':slug/team')
  @HttpCode(HttpStatus.OK)
  async getTeam(
    @Param('slug') slug: string,
    @CurrentUser('id') userId?: string,
    @CurrentUser('role') userRole?: string,
  ) {
    const viewer = userId ? { id: userId, role: userRole ?? 'USER' } : undefined;
    const project = await this.projectsService.findProjectOr404(slug, viewer);
    const data = await this.teamsService.findByProject(project.id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Team members retrieved successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Get(':slug/followers')
  @HttpCode(HttpStatus.OK)
  async getFollowers(
    @Param('slug') slug: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @CurrentUser('id') userId?: string,
    @CurrentUser('role') userRole?: string,
  ) {
    const viewer = userId ? { id: userId, role: userRole ?? 'USER' } : undefined;
    const project = await this.projectsService.findProjectOr404(slug, viewer);
    const { data, meta } = await this.followsService.getFollowers(
      project.id,
      Number(page),
      Number(limit),
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Followers retrieved successfully',
      data,
      meta,
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Get(':slug/follow/check')
  @HttpCode(HttpStatus.OK)
  async isFollowing(
    @Param('slug') slug: string,
    @CurrentUser('id') userId?: string,
    @CurrentUser('role') userRole?: string,
  ) {
    if (!userId) {
      return {
        statusCode: HttpStatus.OK,
        message: 'Following status retrieved',
        data: { following: false },
        timestamp: new Date().toISOString(),
      };
    }
    const viewer = { id: userId, role: userRole ?? 'USER' };
    const project = await this.projectsService.findProjectOr404(slug, viewer);
    const following = await this.followsService.isFollowing(project.id, userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Following status retrieved',
      data: { following },
      timestamp: new Date().toISOString(),
    };
  }

  @Post(':slug/follow')
  @UseGuards(JwtAuthGuard, ScopesGuard)
  @Scopes(ApiKeyScope.PROJECT_WRITE, ApiKeyScope.WRITE)
  @HttpCode(HttpStatus.OK)
  async follow(
    @Param('slug') slug: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: string,
  ) {
    const project = await this.projectsService.findProjectOr404(slug, {
      id: userId,
      role: userRole,
    });
    await this.followsService.follow(project.id, userId);
    const count = await this.followsService.getFollowerCount(project.id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Project followed successfully',
      data: { following: true, followerCount: count },
      timestamp: new Date().toISOString(),
    };
  }

  @Delete(':slug/follow')
  @UseGuards(JwtAuthGuard, ScopesGuard)
  @Scopes(ApiKeyScope.PROJECT_WRITE, ApiKeyScope.DELETE)
  @HttpCode(HttpStatus.OK)
  async unfollow(
    @Param('slug') slug: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: string,
  ) {
    const project = await this.projectsService.findProjectOr404(slug, {
      id: userId,
      role: userRole,
    });
    await this.followsService.unfollow(project.id, userId);
    const count = await this.followsService.getFollowerCount(project.id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Project unfollowed successfully',
      data: { following: false, followerCount: count },
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Get(':slug/related')
  @HttpCode(HttpStatus.OK)
  async getRelated(
    @Param('slug') slug: string,
    @CurrentUser('id') userId?: string,
    @CurrentUser('role') userRole?: string,
  ) {
    const viewer = userId ? { id: userId, role: userRole ?? 'USER' } : undefined;
    const project = await this.projectsService.findProjectOr404(slug, viewer);
    const data = await this.projectsService.getRelatedProjects(project.categoryId, project.id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Related projects retrieved successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, ScopesGuard)
  @Scopes(ApiKeyScope.PROJECT_WRITE, ApiKeyScope.WRITE)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: string,
  ) {
    const project = await this.projectsService.findOne(id);

    if (project.authorId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('You are not allowed to update this project');
    }

    const data = await this.projectsService.update(id, dto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Project updated successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, ScopesGuard)
  @Scopes(ApiKeyScope.PROJECT_WRITE, ApiKeyScope.DELETE)
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: string,
  ) {
    const project = await this.projectsService.findOne(id);

    if (project.authorId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('You are not allowed to delete this project');
    }

    await this.projectsService.remove(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Project deleted successfully',
      data: null,
      timestamp: new Date().toISOString(),
    };
  }
}
