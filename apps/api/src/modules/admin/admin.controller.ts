import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { AdminService } from './admin.service';
import { ChangeRoleDto } from './dto/change-role.dto';
import { ChangeTierDto } from './dto/change-tier.dto';
import { UpdateProjectStatusDto } from './dto/update-project-status.dto';
import { UpdateProjectFeatureDto } from './dto/update-project-feature.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole, ProjectStatus } from '@prisma/client';

interface AdminRequest extends Request {
  user: { id: string; role: UserRole };
}

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'OWNER')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  async listUsers(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('search') search?: string,
    @Query('role') role?: UserRole,
    @Query('banned') banned?: string,
  ) {
    const { data, meta } = await this.adminService.listUsers({
      page: Number(page),
      limit: Math.min(Number(limit), 100),
      search,
      role,
      banned: banned !== undefined ? banned === 'true' : undefined,
    });
    return {
      statusCode: HttpStatus.OK,
      message: 'Users retrieved successfully',
      data,
      meta,
      timestamp: new Date().toISOString(),
    };
  }

  @Patch('users/:id/role')
  @HttpCode(HttpStatus.OK)
  async changeUserRole(
    @Param('id') id: string,
    @Body() dto: ChangeRoleDto,
    @Req() req: AdminRequest,
  ) {
    const actor = { id: req.user.id, role: req.user.role };
    const data = await this.adminService.changeUserRole(id, dto.role as UserRole, actor);
    return {
      statusCode: HttpStatus.OK,
      message: 'User role updated successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Patch('users/:id/tier')
  @HttpCode(HttpStatus.OK)
  async changeUserTier(@Param('id') id: string, @Body() dto: ChangeTierDto) {
    const data = await this.adminService.changeUserTier(id, dto.tier as any);
    return {
      statusCode: HttpStatus.OK,
      message: 'User creator tier updated successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('users/:id/ban')
  @HttpCode(HttpStatus.OK)
  async banUser(@Param('id') id: string) {
    const data = await this.adminService.banUser(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'User banned successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('users/:id/unban')
  @HttpCode(HttpStatus.OK)
  async unbanUser(@Param('id') id: string) {
    const data = await this.adminService.unbanUser(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'User unbanned successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Patch('projects/:id/status')
  @HttpCode(HttpStatus.OK)
  async updateProjectStatus(@Param('id') id: string, @Body() dto: UpdateProjectStatusDto) {
    const data = await this.adminService.updateProjectStatus(id, dto.status as ProjectStatus);
    return {
      statusCode: HttpStatus.OK,
      message: 'Project status updated successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Patch('projects/:id/feature')
  @HttpCode(HttpStatus.OK)
  async updateProjectFeature(@Param('id') id: string, @Body() dto: UpdateProjectFeatureDto) {
    const data = await this.adminService.updateProjectFeature(id, dto.featured);
    return {
      statusCode: HttpStatus.OK,
      message: 'Project featured status updated successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('analytics')
  async getAnalytics() {
    const data = await this.adminService.getAnalytics();
    return {
      statusCode: HttpStatus.OK,
      message: 'Platform analytics retrieved',
      data,
      timestamp: new Date().toISOString(),
    };
  }
}
