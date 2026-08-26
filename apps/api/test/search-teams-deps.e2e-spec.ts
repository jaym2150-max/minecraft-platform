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

describe('Search E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await setupTestApp();
    await cleanDatabase();
    await seedTestData();
  });

  afterAll(async () => {
    await teardownTestApp();
  });

  describe('GET /search', () => {
    it('should return search results', async () => {
      const res = await request(app.getHttpServer()).get('/api/v1/search?q=Test').expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('meta');
    });

    it('should return empty results for nonsense query', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/search?q=zzzzzzzzzqqqqqqqxxxxxx')
        .expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should support pagination params', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/search?q=&page=1&limit=5')
        .expect(200);

      expect(res.body.meta.limit).toBe(5);
    });
  });
});

describe('Teams E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await setupTestApp();
    await cleanDatabase();
    await seedTestData();
  });

  afterAll(async () => {
    await teardownTestApp();
  });

  describe('GET /projects/:projectId/team', () => {
    it('should return team for project', async () => {
      const { projectId } = getTestIds();
      const res = await request(app.getHttpServer())
        .get(`/api/v1/projects/${projectId}/team`)
        .expect(200);

      expect(res.body).toHaveProperty('data');
    });
  });
});

describe('Dependencies E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await setupTestApp();
    await cleanDatabase();
    await seedTestData();
  });

  afterAll(async () => {
    await teardownTestApp();
  });

  describe('GET /projects/:projectId/dependencies', () => {
    it('should return dependencies', async () => {
      const { projectId } = getTestIds();
      const res = await request(app.getHttpServer())
        .get(`/api/v1/projects/${projectId}/dependencies`)
        .expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('POST /projects/:projectId/dependencies', () => {
    it('should require authentication', async () => {
      const { projectId } = getTestIds();
      await request(app.getHttpServer())
        .post(`/api/v1/projects/${projectId}/dependencies`)
        .send({ requiredId: 'some-id' })
        .expect(401);
    });

    it('should reject self-dependency', async () => {
      const token = getAuthToken();
      const { projectId } = getTestIds();
      const res = await request(app.getHttpServer())
        .post(`/api/v1/projects/${projectId}/dependencies`)
        .set('Authorization', `Bearer ${token}`)
        .send({ requiredId: projectId });

      expect([400, 409]).toContain(res.status);
    });
  });
});
