import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

/** Mutable counters carried through one sync run. */
export interface SyncCounters {
  processed: number;
  created: number;
  updated: number;
  error: number;
}

export const emptyCounters = (): SyncCounters => ({
  processed: 0,
  created: 0,
  updated: 0,
  error: 0,
});

const MAX_MESSAGE = 1000;
const MAX_DETAIL = 4000;

/**
 * Persistence lifecycle for provider sync runs. Every run (manual or
 * scheduled) gets a SyncJob row plus structured SyncLog lines so admins can
 * audit exactly what a sync did — the spec's "Last sync / Status / Projects
 * processed / updated / Errors" requirement.
 */
@Injectable()
export class SyncJobsService {
  constructor(private readonly prisma: PrismaService) {}

  create(providerId: string, type: string, trigger: string) {
    return this.prisma.syncJob.create({
      data: {
        providerId,
        type: type as any,
        trigger: trigger as any,
        status: 'PENDING' as any,
      },
    });
  }

  markRunning(syncJobId: string) {
    return this.prisma.syncJob.update({
      where: { id: syncJobId },
      data: { status: 'RUNNING' as any, startedAt: new Date() },
    });
  }

  async log(
    syncJobId: string,
    level: 'INFO' | 'WARN' | 'ERROR',
    message: string,
    detail?: unknown,
  ) {
    let detailStr: string | undefined;
    if (detail !== undefined) {
      detailStr = (typeof detail === 'string' ? detail : JSON.stringify(detail)).slice(
        0,
        MAX_DETAIL,
      );
    }
    await this.prisma.syncLog
      .create({
        data: {
          syncJobId,
          level: level as any,
          message: message.slice(0, MAX_MESSAGE),
          detail: detailStr ?? null,
        },
      })
      .catch(() => {
        // Logging must never abort the sync itself.
      });
  }

  setCounters(syncJobId: string, counters: SyncCounters) {
    return this.prisma.syncJob
      .update({
        where: { id: syncJobId },
        data: {
          processedCount: counters.processed,
          createdCount: counters.created,
          updatedCount: counters.updated,
          errorCount: counters.error,
        },
      })
      .catch(() => undefined);
  }

  finish(
    syncJobId: string,
    status: 'COMPLETED' | 'FAILED',
    message: string | null,
    counters?: SyncCounters,
  ) {
    return this.prisma.syncJob.update({
      where: { id: syncJobId },
      data: {
        status: status as any,
        message: message?.slice(0, MAX_MESSAGE) ?? null,
        finishedAt: new Date(),
        // On failure the partial counters were already flushed during the
        // run; don't clobber them with zeros.
        ...(counters
          ? {
              processedCount: counters.processed,
              createdCount: counters.created,
              updatedCount: counters.updated,
              errorCount: counters.error,
            }
          : {}),
      },
    });
  }

  /** finishedAt of the newest successful run among the given types. */
  async lastSuccessfulRun(providerId: string, types: string[]): Promise<Date | null> {
    const job = await this.prisma.syncJob.findFirst({
      where: {
        providerId,
        status: 'COMPLETED' as any,
        type: { in: types as any },
        finishedAt: { not: null },
      },
      orderBy: { finishedAt: 'desc' },
      select: { finishedAt: true },
    });
    return job?.finishedAt ?? null;
  }

  list(providerId?: string, take = 20) {
    return this.prisma.syncJob.findMany({
      where: providerId ? { providerId } : undefined,
      orderBy: { createdAt: 'desc' },
      take: Math.min(take, 100),
      include: { provider: { select: { slug: true, name: true } } },
    });
  }

  get(syncJobId: string) {
    return this.prisma.syncJob.findUnique({
      where: { id: syncJobId },
      include: {
        provider: { select: { slug: true, name: true } },
        logs: { orderBy: { createdAt: 'asc' }, take: 500 },
      },
    });
  }
}
