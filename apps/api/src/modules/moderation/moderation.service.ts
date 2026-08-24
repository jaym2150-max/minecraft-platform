import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';
import { ResolveReportDto } from './dto/resolve-report.dto';
import { ReportStatus } from '@prisma/client';

@Injectable()
export class ModerationService {
  private readonly logger = new Logger(ModerationService.name);

  constructor(private prisma: PrismaService) {}

  async createReport(reporterId: string, dto: CreateReportDto): Promise<any> {
    let projectId: string | null = null;

    if (dto.type === 'project') {
      projectId = dto.reportedId;
    } else if (dto.type === 'user') {
      const user = await this.prisma.user.findUnique({ where: { id: dto.reportedId } });
      if (!user) throw new NotFoundException('Reported user not found');
    } else if (dto.type === 'comment') {
      const comment = await this.prisma.comment.findUnique({ where: { id: dto.reportedId } });
      if (!comment) throw new NotFoundException('Reported comment not found');
      projectId = comment.projectId;
    } else if (dto.type === 'version') {
      const version = await this.prisma.projectVersion.findUnique({ where: { id: dto.reportedId } });
      if (!version) throw new NotFoundException('Reported version not found');
      projectId = version.projectId;
    }

    const report = await this.prisma.report.create({
      data: {
        reporterId,
        reportedId: dto.reportedId,
        reason: dto.reason,
        description: dto.description,
        projectId,
        status: ReportStatus.PENDING,
      },
      include: {
        reporter: { select: { id: true, username: true } },
      },
    });

    return this.format(report);
  }

  async findAllReports(page = 1, limit = 20, status?: ReportStatus): Promise<any> {
    const where = status ? { status } : {};
    const skip = (page - 1) * limit;

    const [reports, total] = await Promise.all([
      this.prisma.report.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          reporter: { select: { id: true, username: true, avatarUrl: true } },
        },
      }),
      this.prisma.report.count({ where }),
    ]);

    return {
      data: reports.map((r) => this.format(r)),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string): Promise<any> {
    const report = await this.prisma.report.findUnique({
      where: { id },
      include: {
        reporter: { select: { id: true, username: true, avatarUrl: true } },
      },
    });
    if (!report) {
      throw new NotFoundException(`Report with id "${id}" not found`);
    }
    return this.format(report);
  }

  async resolve(id: string, resolverId: string, dto: ResolveReportDto): Promise<any> {
    const report = await this.prisma.report.findUnique({ where: { id } });
    if (!report) {
      throw new NotFoundException(`Report with id "${id}" not found`);
    }
    if (report.status !== ReportStatus.PENDING) {
      throw new NotFoundException(`Report with id "${id}" is already ${report.status.toLowerCase()}`);
    }

    const updated = await this.prisma.report.update({
      where: { id },
      data: {
        status: dto.status as ReportStatus,
        resolvedAt: new Date(),
        resolvedBy: resolverId,
        description: dto.resolution
          ? `${report.description ?? ''}\n\n[Resolution]: ${dto.resolution}`.trim()
          : report.description,
      },
      include: {
        reporter: { select: { id: true, username: true, avatarUrl: true } },
      },
    });

    return this.format(updated);
  }

  async getStats(): Promise<any> {
    const [pending, resolved, dismissed, byReason] = await Promise.all([
      this.prisma.report.count({ where: { status: 'PENDING' } }),
      this.prisma.report.count({ where: { status: 'RESOLVED' } }),
      this.prisma.report.count({ where: { status: 'DISMISSED' } }),
      this.prisma.report.groupBy({
        by: ['reason'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10,
      }),
    ]);

    return {
      pending,
      resolved,
      dismissed,
      total: pending + resolved + dismissed,
      topReasons: byReason.map((r) => ({ reason: r.reason, count: r._count.id })),
    };
  }

  private format(report: any): any {
    return {
      id: report.id,
      reason: report.reason,
      description: report.description ?? undefined,
      status: report.status,
      reporterId: report.reporterId,
      reportedId: report.reportedId,
      projectId: report.projectId ?? undefined,
      createdAt:
        report.createdAt instanceof Date ? report.createdAt.toISOString() : report.createdAt,
      resolvedAt:
        report.resolvedAt instanceof Date ? report.resolvedAt.toISOString() : report.resolvedAt,
      resolvedBy: report.resolvedBy ?? undefined,
      reporter: report.reporter,
    };
  }
}
