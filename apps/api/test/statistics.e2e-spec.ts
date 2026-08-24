import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  setupTestApp,
  teardownTestApp,
  cleanDatabase,
  seedTestData,
} from './test-helpers';

describe('Statistics E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await setupTestApp();
    await cleanDatabase();
    await seedTestData();
  });

  afterAll(async () => {
    await teardownTestApp();
  });

  describe('GET /statistics', () => {
    it.skip('should return instance-wide statistics (requires controller)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/statistics')
        .expect(200);

      expect(res.body.data).toHaveProperty('projects');
      expect(res.body.data).toHaveProperty('versions');
      expect(res.body.data).toHaveProperty('users');
      expect(typeof res.body.data.projects).toBe('number');
    });
  });

  describe('GET /projects/random', () => {
    it.skip('should return random published projects (requires controller)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/projects/random?count=3')
        .expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeLessThanOrEqual(3);
    });
  });
});
