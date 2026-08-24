import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { AddTeamMemberDto, UpdateTeamMemberDto } from './dto/update-team.dto';
import { TeamRole } from '@prisma/client';

@Injectable()
export class TeamsService {
  private readonly logger = new Logger(TeamsService.name);

  constructor(private prisma: PrismaService) {}

  async findByProject(projectId: string): Promise<any> {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      throw new NotFoundException(`Project with id "${projectId}" not found`);
    }

    const team = await this.prisma.team.findFirst({
      where: { projectId },
      include: {
        members: {
          include: {
            user: { select: { id: true, username: true, avatarUrl: true } },
          },
        },
      },
    });

    if (!team) {
      return null;
    }

    return {
      id: team.id,
      name: team.name,
      description: team.description,
      projectId: team.projectId,
      createdAt: team.createdAt.toISOString(),
      updatedAt: team.updatedAt.toISOString(),
      members: team.members.map((m) => ({
        id: m.id,
        userId: m.userId,
        role: m.role,
        user: m.user,
      })),
    };
  }

  async create(dto: CreateTeamDto): Promise<any> {
    const project = await this.prisma.project.findUnique({ where: { id: dto.projectId } });
    if (!project) {
      throw new NotFoundException(`Project with id "${dto.projectId}" not found`);
    }

    const existing = await this.prisma.team.findFirst({ where: { projectId: dto.projectId } });
    if (existing) {
      throw new ConflictException('A team already exists for this project');
    }

    const team = await this.prisma.team.create({
      data: {
        name: dto.name,
        description: dto.description,
        projectId: dto.projectId,
        members: {
          create: dto.members.map((m) => ({
            role: m.role,
            userId: m.userId,
            projectId: dto.projectId,
          })),
        },
      },
      include: {
        members: {
          include: {
            user: { select: { id: true, username: true, avatarUrl: true } },
          },
        },
      },
    });

    return this.format(team);
  }

  async update(teamId: string, dto: { name?: string; description?: string }): Promise<any> {
    const team = await this.prisma.team.findUnique({ where: { id: teamId } });
    if (!team) {
      throw new NotFoundException(`Team with id "${teamId}" not found`);
    }

    const updated = await this.prisma.team.update({
      where: { id: teamId },
      data: { name: dto.name, description: dto.description },
      include: {
        members: {
          include: {
            user: { select: { id: true, username: true, avatarUrl: true } },
          },
        },
      },
    });

    return this.format(updated);
  }

  async addMember(teamId: string, dto: AddTeamMemberDto): Promise<any> {
    const team = await this.prisma.team.findUnique({ where: { id: teamId } });
    if (!team) {
      throw new NotFoundException(`Team with id "${teamId}" not found`);
    }

    const existing = await this.prisma.teamMember.findUnique({
      where: { userId_teamId: { userId: dto.userId, teamId } },
    });
    if (existing) {
      throw new ConflictException('User is already a member of this team');
    }

    const member = await this.prisma.teamMember.create({
      data: {
        teamId,
        userId: dto.userId,
        role: dto.role,
        projectId: team.projectId,
      },
      include: {
        user: { select: { id: true, username: true, avatarUrl: true } },
      },
    });

    return member;
  }

  async updateMemberRole(memberId: string, role: TeamRole): Promise<any> {
    const member = await this.prisma.teamMember.findUnique({ where: { id: memberId } });
    if (!member) {
      throw new NotFoundException(`Team member with id "${memberId}" not found`);
    }

    const updated = await this.prisma.teamMember.update({
      where: { id: memberId },
      data: { role },
      include: {
        user: { select: { id: true, username: true, avatarUrl: true } },
      },
    });

    return updated;
  }

  async removeMember(memberId: string): Promise<void> {
    const member = await this.prisma.teamMember.findUnique({ where: { id: memberId } });
    if (!member) {
      throw new NotFoundException(`Team member with id "${memberId}" not found`);
    }
    if (member.role === TeamRole.OWNER) {
      throw new ConflictException('Cannot remove the team owner');
    }
    await this.prisma.teamMember.delete({ where: { id: memberId } });
  }

  async remove(teamId: string): Promise<void> {
    const team = await this.prisma.team.findUnique({ where: { id: teamId } });
    if (!team) {
      throw new NotFoundException(`Team with id "${teamId}" not found`);
    }
    await this.prisma.$transaction([
      this.prisma.teamMember.deleteMany({ where: { teamId } }),
      this.prisma.team.delete({ where: { id: teamId } }),
    ]);
  }

  private format(team: any) {
    return {
      id: team.id,
      name: team.name,
      description: team.description,
      projectId: team.projectId,
      createdAt: team.createdAt instanceof Date ? team.createdAt.toISOString() : team.createdAt,
      updatedAt: team.updatedAt instanceof Date ? team.updatedAt.toISOString() : team.updatedAt,
      members: team.members?.map((m: any) => ({
        id: m.id,
        userId: m.userId,
        role: m.role,
        user: m.user,
      })),
    };
  }
}
