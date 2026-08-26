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
} from '@nestjs/common';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { AddTeamMemberDto, UpdateTeamMemberDto } from './dto/update-team.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller()
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Get('projects/:projectId/team')
  @Public()
  @HttpCode(HttpStatus.OK)
  async findByProject(@Param('projectId') projectId: string) {
    const data = await this.teamsService.findByProject(projectId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Team retrieved successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('teams')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'OWNER')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateTeamDto) {
    const data = await this.teamsService.create(dto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Team created successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Patch('teams/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'OWNER')
  async update(@Param('id') id: string, @Body() dto: { name?: string; description?: string }) {
    const data = await this.teamsService.update(id, dto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Team updated successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Delete('teams/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'OWNER')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    await this.teamsService.remove(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Team deleted successfully',
      data: null,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('teams/:id/members')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'OWNER')
  @HttpCode(HttpStatus.CREATED)
  async addMember(@Param('id') id: string, @Body() dto: AddTeamMemberDto) {
    const data = await this.teamsService.addMember(id, dto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Team member added successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Patch('teams/:teamId/members/:memberId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'OWNER')
  async updateMember(@Param('memberId') memberId: string, @Body() dto: UpdateTeamMemberDto) {
    const data = await this.teamsService.updateMemberRole(memberId, dto.role);
    return {
      statusCode: HttpStatus.OK,
      message: 'Team member role updated successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Delete('teams/:teamId/members/:memberId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'OWNER')
  @HttpCode(HttpStatus.OK)
  async removeMember(@Param('memberId') memberId: string) {
    await this.teamsService.removeMember(memberId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Team member removed successfully',
      data: null,
      timestamp: new Date().toISOString(),
    };
  }
}
