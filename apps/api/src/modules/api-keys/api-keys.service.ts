import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ApiKeyScope } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class ApiKeysService {
  private readonly logger = new Logger(ApiKeysService.name);

  constructor(private prisma: PrismaService) {}

  async create(userId: string, name: string, scopes: ApiKeyScope[] = [ApiKeyScope.READ]) {
    const key = `mp_${crypto.randomBytes(32).toString('hex')}`;
    const keyHash = this.hashKey(key);
    const lastChars = key.slice(-4);

    const created = await this.prisma.apiKey.create({
      data: { name, keyHash, lastChars, userId, scopes },
    });

    return {
      key,
      name: created.name,
      lastChars: created.lastChars,
      scopes: created.scopes,
    };
  }

  async findAll(userId: string) {
    const keys = await this.prisma.apiKey.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        lastChars: true,
        scopes: true,
        lastUsedAt: true,
        createdAt: true,
        expiresAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return keys;
  }

  async findOne(id: string, userId: string) {
    const key = await this.prisma.apiKey.findFirst({
      where: { id, userId },
      select: {
        id: true,
        name: true,
        lastChars: true,
        scopes: true,
        lastUsedAt: true,
        createdAt: true,
        expiresAt: true,
      },
    });
    if (!key) throw new NotFoundException('API key not found');
    return key;
  }

  async remove(id: string, userId: string) {
    const key = await this.prisma.apiKey.findFirst({
      where: { id, userId },
    });
    if (!key) throw new NotFoundException('API key not found');
    await this.prisma.apiKey.delete({ where: { id } });
    return { message: 'API key revoked successfully' };
  }

  async validate(key: string): Promise<{ userId: string; scopes: ApiKeyScope[] } | null> {
    const keyHash = this.hashKey(key);
    const entry = await this.prisma.apiKey.findUnique({
      where: { keyHash },
    });
    if (!entry) return null;
    if (entry.expiresAt && entry.expiresAt < new Date()) return null;

    await this.prisma.apiKey.update({
      where: { id: entry.id },
      data: { lastUsedAt: new Date() },
    });

    return { userId: entry.userId, scopes: (entry.scopes as ApiKeyScope[]) ?? [ApiKeyScope.READ] };
  }

  private hashKey(key: string): string {
    return crypto.createHash('sha256').update(key).digest('hex');
  }
}
