import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../src/common/prisma/prisma.service';
import {
  setupTestApp,
  teardownTestApp,
  cleanDatabase,
  seedTestData,
  getAuthToken,
  getAdminToken,
} from './test-helpers';
import { createHash } from 'node:crypto';

function makeKey(name: string): string {
  return `mcp_pat_${createHash('sha256').update(name).digest('hex').slice(0, 32)}`;
}

describe('API key scopes E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let userId: string;

  beforeAll(async () => {
    app = await setupTestApp();
    await cleanDatabase();
    await seedTestData();

    prisma = app.get(PrismaService);

    const user = await prisma.user.findUnique({ where: { email: 'test@example.com' } });
    if (!user) throw new Error('test user missing');
    userId = user.id;

    await prisma.apiKey.create({
      data: {
        name: 'readonly',
        keyHash: createHash('sha256').update(makeKey('readonly')).digest('hex'),
        lastChars: 'ro',
        scopes: ['READ'] as never,
        userId,
      },
    });
    await prisma.apiKey.create({
      data: {
        name: 'projectwrite',
        keyHash: createHash('sha256').update(makeKey('projectwrite')).digest('hex'),
        lastChars: 'pw',
        scopes: ['READ', 'PROJECT_WRITE'] as never,
        userId,
      },
    });
  });

  afterAll(async () => {
    await teardownTestApp();
  });

  describe('PROJECT_WRITE scope required', () => {
    it.skip('should reject an API key without PROJECT_WRITE when creating a project', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${makeKey('readonly')}`)
        .send({ title: 'No scope', description: 'Should fail', body: 'b' });

      expect([401, 403]).toContain(res.status);
    });

    it.skip('should accept an API key with PROJECT_WRITE', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${makeKey('projectwrite')}`)
        .send({ title: 'Scoped Mod', description: 'Works', body: 'b' });

      expect([200, 201]).toContain(res.status);
    });
  });

  describe('User session token baseline', () => {
    it('a logged-in user can read their own profile', async () => {
      const token = getAuthToken();
      const res = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.data).toHaveProperty('email', 'test@example.com');
    });

    it('admin token still works', async () => {
      const token = getAdminToken();
      const res = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(['admin_test', 'admin@minecraftplatform.com']).toContain(res.body.data.username);
    });
  });
});
