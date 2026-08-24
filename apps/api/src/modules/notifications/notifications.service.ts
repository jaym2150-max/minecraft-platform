import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { paginateCursor, CursorPage } from '../../common/pagination';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private prisma: PrismaService,
    @InjectQueue('notifications') private notificationsQueue: Queue,
  ) {}

  async create(dto: CreateNotificationDto): Promise<any> {
    const notification = await this.prisma.notification.create({
      data: {
        userId: dto.userId,
        type: dto.type as NotificationType,
        title: dto.title,
        body: dto.body,
      },
    });

    await this.notificationsQueue.add(
      'send-notification',
      {
        notificationId: notification.id,
        userId: dto.userId,
        type: dto.type,
        title: dto.title,
        body: dto.body,
      },
      {
        jobId: `notification:${notification.id}`,
        attempts: 5,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: { age: 86400, count: 1000 },
        removeOnFail: { age: 604800 },
      },
    );

    return this.format(notification);
  }

  async findByUser(userId: string, page = 1, limit = 20, unreadOnly = false): Promise<any> {
    const skip = (page - 1) * limit;
    const where = { userId, ...(unreadOnly ? { read: false } : {}) };

    const [notifications, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({ where: { userId, read: false } }),
    ]);

    return {
      data: notifications.map((n) => this.format(n)),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit), unreadCount },
    };
  }

  async findByUserCursor(
    userId: string,
    options: { cursor?: string; limit?: number; unreadOnly?: boolean } = {},
  ): Promise<CursorPage<any>> {
    return paginateCursor<any>({
      take: options.limit ?? 20,
      cursor: options.cursor,
      where: { userId, ...(options.unreadOnly ? { read: false } : {}) },
      orderBy: { createdAt: 'desc' },
      prismaDelegate: {
        findMany: (args) => this.prisma.notification.findMany(args as any),
      },
    }).then((page) => ({
      ...page,
      data: page.data.map((n) => this.format(n)),
    }));
  }

  async findOne(id: string, userId: string): Promise<any> {
    const notification = await this.prisma.notification.findUnique({ where: { id } });
    if (!notification) {
      throw new NotFoundException(`Notification with id "${id}" not found`);
    }
    if (notification.userId !== userId) {
      throw new NotFoundException(`Notification with id "${id}" not found`);
    }
    return this.format(notification);
  }

  async markAsRead(id: string, userId: string): Promise<any> {
    const notification = await this.prisma.notification.findUnique({ where: { id } });
    if (!notification || notification.userId !== userId) {
      throw new NotFoundException(`Notification with id "${id}" not found`);
    }

    const updated = await this.prisma.notification.update({
      where: { id },
      data: { read: true },
    });

    return this.format(updated);
  }

  async markAllAsRead(userId: string): Promise<{ count: number }> {
    const result = await this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
    return { count: result.count };
  }

  async remove(id: string, userId: string): Promise<void> {
    const notification = await this.prisma.notification.findUnique({ where: { id } });
    if (!notification || notification.userId !== userId) {
      throw new NotFoundException(`Notification with id "${id}" not found`);
    }
    await this.prisma.notification.delete({ where: { id } });
  }

  async clearAll(userId: string): Promise<{ count: number }> {
    const result = await this.prisma.notification.deleteMany({ where: { userId } });
    return { count: result.count };
  }

  private format(n: any) {
    return {
      id: n.id,
      type: n.type,
      title: n.title,
      body: n.body ?? undefined,
      read: n.read,
      userId: n.userId,
      createdAt: n.createdAt instanceof Date ? n.createdAt.toISOString() : n.createdAt,
    };
  }
}
