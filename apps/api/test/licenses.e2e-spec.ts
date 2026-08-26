import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../src/common/prisma/prisma.service';
import { setupTestApp, teardownTestApp, cleanDatabase } from './test-helpers';

describe('Licenses E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    app = await setupTestApp();
    await cleanDatabase();
    prisma = app.get(PrismaService);

    // The migration seeds standard licenses, but tests start from an empty DB
    // (cleanDatabase wipes everything). Re-seed the canonical set so this spec
    // is self-sufficient.
    await prisma.license.create({
      data: {
        shortId: 'MIT',
        name: 'MIT License',
        type: 'PERMISSIVE' as never,
        url: 'https://opensource.org/licenses/MIT',
        description: 'Permissive license',
        featured: true,
      },
    });
    await prisma.license.create({
      data: {
        shortId: 'Apache-2.0',
        name: 'Apache License 2.0',
        type: 'PERMISSIVE' as never,
        url: 'https://www.apache.org/licenses/LICENSE-2.0',
        description: 'Permissive license with patent grant',
        featured: true,
      },
    });
  });

  afterAll(async () => {
    await teardownTestApp();
  });

  describe('GET /licenses', () => {
    it('should list all licenses', async () => {
      const res = await request(app.getHttpServer()).get('/api/v1/licenses').expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
      expect(res.body.data.find((l: { shortId: string }) => l.shortId === 'MIT')).toBeDefined();
    });
  });

  describe('GET /licenses/:shortId', () => {
    it('should return a license by shortId', async () => {
      const res = await request(app.getHttpServer()).get('/api/v1/licenses/MIT').expect(200);

      expect(res.body.data).toHaveProperty('shortId', 'MIT');
      expect(res.body.data).toHaveProperty('type', 'PERMISSIVE');
    });

    it('should return 404 for unknown license', async () => {
      await request(app.getHttpServer()).get('/api/v1/licenses/does-not-exist').expect(404);
    });
  });

  describe('GET /licenses/:shortId/text', () => {
    it.skip('should return the license body text (requires controller)', async () => {
      const res = await request(app.getHttpServer()).get('/api/v1/licenses/MIT/text').expect(200);
      expect(res.body.data).toHaveProperty('shortId', 'MIT');
    });
  });

  describe('POST /admin/licenses', () => {
    it.skip('should create a license when admin (requires controller + admin auth)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/admin/licenses')
        .send({
          shortId: 'TEST',
          name: 'Test License',
          type: 'PERMISSIVE',
        })
        .expect(201);
      expect(res.body.data.shortId).toBe('TEST');
    });
  });
});
