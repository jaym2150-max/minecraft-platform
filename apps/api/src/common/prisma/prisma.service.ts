import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const isDev = process.env.NODE_ENV !== 'production';
    super({
      log: [
        ...(isDev ? [{ emit: 'event' as const, level: 'query' as const }] : []),
        { emit: 'stdout', level: 'info' },
        { emit: 'stdout', level: 'warn' },
        { emit: 'stdout', level: 'error' },
      ],
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Connected to database');
    } catch (error) {
      this.logger.error('Failed to connect to database. Is PostgreSQL running?');
      this.logger.error('Run `docker compose up -d` to start required services.');
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Disconnected from database');
  }
}
