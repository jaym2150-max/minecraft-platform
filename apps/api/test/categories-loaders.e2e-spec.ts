import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  setupTestApp,
  teardownTestApp,
  cleanDatabase,
  seedTestData,
  getApp,
  getAdminToken,
  getAuthToken,
  getTestIds,
} from './test-helpers';

describe('Categories & Loaders E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await setupTestApp();
    await cleanDatabase();
    await seedTestData();
  });

  afterAll(async () => {
    await teardownTestApp();
  });

  describe('GET /categories', () => {
    it('should list all categories', async () => {
      const res = await request(app.getHttpServer()).get('/api/v1/categories').expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /categories/:slug', () => {
    it('should get a category by slug', async () => {
      const res = await request(app.getHttpServer()).get('/api/v1/categories/test').expect(200);

      expect(res.body.data).toHaveProperty('name', 'Test');
    });

    it('should return 404 for non-existent category', async () => {
      await request(app.getHttpServer()).get('/api/v1/categories/does-not-exist').expect(404);
    });
  });

  describe('POST /categories', () => {
    it('should create category as admin', async () => {
      const token = getAdminToken();
      const res = await request(app.getHttpServer())
        .post('/api/v1/categories')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Adventure',
          slug: 'adventure',
          description: 'Adventure mods',
        })
        .expect(201);

      expect(res.body.data).toHaveProperty('name', 'Adventure');
    });

    it('should reject non-admin creation', async () => {
      const token = getAuthToken();
      const res = await request(app.getHttpServer())
        .post('/api/v1/categories')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Unauthorized',
          slug: 'unauthorized',
        });

      expect(res.status).toBe(403);
    });
  });

  describe('GET /loaders', () => {
    it('should list loader types', async () => {
      const res = await request(app.getHttpServer()).get('/api/v1/loaders').expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('GET /minecraft-versions', () => {
    it('should list all MC versions', async () => {
      const res = await request(app.getHttpServer()).get('/api/v1/minecraft-versions').expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should filter for stable only', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/minecraft-versions/stable')
        .expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
      res.body.data.forEach((v: any) => expect(v.stable).toBe(true));
    });
  });
});
