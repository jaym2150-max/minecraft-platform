import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  setupTestApp,
  teardownTestApp,
  cleanDatabase,
  seedTestData,
  getTestIds,
} from './test-helpers';

describe('Bulk endpoints E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await setupTestApp();
    await cleanDatabase();
    await seedTestData();
  });

  afterAll(async () => {
    await teardownTestApp();
  });

  describe('GET /projects?ids=', () => {
    it.skip('should return multiple projects by id list (requires bulk controller)', async () => {
      const { projectId } = getTestIds();
      const res = await request(app.getHttpServer())
        .get(`/api/v1/projects?ids=${projectId}`)
        .expect(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(1);
    });
  });

  describe('GET /versions?ids=', () => {
    it.skip('should return multiple versions by id list', async () => {
      const { versionId } = getTestIds();
      const res = await request(app.getHttpServer())
        .get(`/api/v1/versions?ids=${versionId}`)
        .expect(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('GET /users?ids=', () => {
    it.skip('should return multiple users by id list', async () => {
      const { userId } = getTestIds();
      const res = await request(app.getHttpServer())
        .get(`/api/v1/users?ids=${userId}`)
        .expect(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });
});
