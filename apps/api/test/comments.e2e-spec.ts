import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  setupTestApp,
  teardownTestApp,
  cleanDatabase,
  seedTestData,
  getApp,
  getAuthToken,
  getTestIds,
} from './test-helpers';

describe('Comments E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await setupTestApp();
    await cleanDatabase();
    await seedTestData();
  });

  afterAll(async () => {
    await teardownTestApp();
  });

  describe('POST /comments', () => {
    it('should create a comment on a project', async () => {
      const token = getAuthToken();
      const { projectId } = getTestIds();
      const res = await request(app.getHttpServer())
        .post('/api/v1/comments')
        .set('Authorization', `Bearer ${token}`)
        .send({
          content: 'Great mod!',
          projectId,
        })
        .expect(201);

      expect(res.body.data).toHaveProperty('content', 'Great mod!');
      expect(res.body.data.authorId).toBeDefined();
    });

    it('should reject empty content', async () => {
      const token = getAuthToken();
      const { projectId } = getTestIds();
      await request(app.getHttpServer())
        .post('/api/v1/comments')
        .set('Authorization', `Bearer ${token}`)
        .send({ content: '', projectId })
        .expect(400);
    });

    it('should reject too-long content', async () => {
      const token = getAuthToken();
      const { projectId } = getTestIds();
      const long = 'a'.repeat(2001);
      await request(app.getHttpServer())
        .post('/api/v1/comments')
        .set('Authorization', `Bearer ${token}`)
        .send({ content: long, projectId })
        .expect(400);
    });

    it('should reject unauthenticated', async () => {
      const { projectId } = getTestIds();
      await request(app.getHttpServer())
        .post('/api/v1/comments')
        .send({ content: 'anonymous', projectId })
        .expect(401);
    });
  });

  describe('GET /comments/project/:projectId', () => {
    it('should list comments for a project', async () => {
      const { projectId } = getTestIds();
      const res = await request(app.getHttpServer())
        .get(`/api/v1/comments/project/${projectId}`)
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });
});
