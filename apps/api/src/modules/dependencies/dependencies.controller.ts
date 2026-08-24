import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import { DependenciesService } from './dependencies.service';
import { CreateDependencyDto, UpdateDependencyDto } from './dto/dependency.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PrismaService } from '../../common/prisma/prisma.service';

@Controller()
export class DependenciesController {
  constructor(
    private readonly dependenciesService: DependenciesService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('projects/:projectId/dependencies')
  @Public()
  @HttpCode(HttpStatus.OK)
  async findByProject(@Param('projectId') projectId: string) {
    const data = await this.dependenciesService.findByProject(projectId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Dependencies retrieved successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('projects/:projectId/dependencies')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('projectId') projectId: string,
    @Body() dto: CreateDependencyDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: string,
  ) {
    await this.verifyProjectOwnership(projectId, { id: userId, role: userRole });
    const data = await this.dependenciesService.create(projectId, dto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Dependency created successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Patch('dependencies/:id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateDependencyDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: string,
  ) {
    await this.verifyDependencyOwnership(id, { id: userId, role: userRole });
    const data = await this.dependenciesService.update(id, dto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Dependency updated successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Delete('dependencies/:id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string, @CurrentUser('id') userId: string, @CurrentUser('role') userRole: string) {
    await this.verifyDependencyOwnership(id, { id: userId, role: userRole });
    await this.dependenciesService.remove(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Dependency removed successfully',
      data: null,
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
      throw new ForbiddenException('You can only modify dependencies on your own projects');
    }
  }

  private async verifyDependencyOwnership(dependencyId: string, user: { id: string; role: string }) {
    const dep = await this.prisma.dependency.findUnique({
      where: { id: dependencyId },
      select: { dependentId: true },
    });
    if (!dep) {
      throw new ForbiddenException('Dependency not found');
    }
    await this.verifyProjectOwnership(dep.dependentId, user);
  }
}
