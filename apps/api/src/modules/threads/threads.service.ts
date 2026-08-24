import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ThreadType } from '@prisma/client';

@Injectable()
export class ThreadsService {
  constructor(private prisma: PrismaService) {}

  async listMine(userId: string) {
    const threads = await this.prisma.thread.findMany({
      where: {
        OR: [
          { initiatorId: userId },
          { participants: { some: { userId } } },
        ],
      },
      orderBy: { lastMessageAt: 'desc' },
      include: {
        initiator: { select: { id: true, username: true, avatarUrl: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { id: true, body: true, createdAt: true, authorId: true },
        },
        _count: { select: { messages: true, participants: true } },
      },
    });
    return threads.map((t) => this.format(t));
  }

  async findOne(threadId: string, userId: string) {
    const thread = await this.prisma.thread.findUnique({
      where: { id: threadId },
      include: {
        initiator: { select: { id: true, username: true, avatarUrl: true } },
        participants: {
          include: { user: { select: { id: true, username: true, avatarUrl: true } } },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
          include: { author: { select: { id: true, username: true, avatarUrl: true } } },
        },
      },
    });
    if (!thread) throw new NotFoundException('Thread not found');

    const isParticipant =
      thread.initiatorId === userId ||
      thread.participants.some((p) => p.userId === userId);
    if (!isParticipant) throw new ForbiddenException('Not a participant of this thread');

    return this.format(thread);
  }

  async postMessage(threadId: string, userId: string, body: string) {
    const thread = await this.prisma.thread.findUnique({
      where: { id: threadId },
      select: { id: true, initiatorId: true, status: true },
    });
    if (!thread) throw new NotFoundException('Thread not found');

    const isParticipant =
      thread.initiatorId === userId ||
      !!(await this.prisma.threadParticipant.findUnique({
        where: { threadId_userId: { threadId, userId } },
      }));
    if (!isParticipant) throw new ForbiddenException('Not a participant of this thread');
    if (thread.status !== 'open') throw new ForbiddenException('Thread is closed');

    const [message] = await this.prisma.$transaction([
      this.prisma.threadMessage.create({
        data: { threadId, authorId: userId, body },
      }),
      this.prisma.thread.update({
        where: { id: threadId },
        data: { lastMessageAt: new Date() },
      }),
    ]);

    return {
      id: message.id,
      threadId: message.threadId,
      authorId: message.authorId,
      body: message.body,
      hidden: message.hidden,
      createdAt: message.createdAt.toISOString(),
    };
  }

  private format(t: any) {
    return {
      id: t.id,
      type: t.type,
      title: t.title,
      status: t.status,
      subjectId: t.subjectId ?? undefined,
      subjectType: t.subjectType ?? undefined,
      initiatorId: t.initiatorId,
      initiator: t.initiator,
      participants: t.participants?.map((p: any) => ({
        userId: p.userId,
        role: p.role,
        joinedAt: p.joinedAt?.toISOString?.() ?? p.joinedAt,
        user: p.user,
      })),
      lastMessageAt: t.lastMessageAt instanceof Date ? t.lastMessageAt.toISOString() : t.lastMessageAt,
      createdAt: t.createdAt instanceof Date ? t.createdAt.toISOString() : t.createdAt,
      updatedAt: t.updatedAt instanceof Date ? t.updatedAt.toISOString() : t.updatedAt,
      messageCount: t._count?.messages ?? t.messages?.length ?? 0,
      messages: t.messages?.map((m: any) => ({
        id: m.id,
        threadId: m.threadId,
        authorId: m.authorId,
        author: m.author,
        body: m.hidden ? '[hidden]' : m.body,
        hidden: m.hidden,
        createdAt: m.createdAt instanceof Date ? m.createdAt.toISOString() : m.createdAt,
      })),
    };
  }
}
