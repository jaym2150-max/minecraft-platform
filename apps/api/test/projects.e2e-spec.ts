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

describe('Projects E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await setupTestApp();
    await cleanDatabase();
    await seedTestData();
  });

  afterAll(async () => {
    await teardownTestApp();
  });

  describe('GET /projects', () => {
    it('should list all published projects', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/projects')
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body).toHaveProperty('meta');
    });

    it('should support search', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/projects?search=Test')
        .expect(200);

      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('should support pagination', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/projects?page=1&limit=5')
        .expect(200);

      expect(res.body.meta.limit).toBe(5);
      expect(res.body.meta.page).toBe(1);
    });

    it('should support filtering by category', async () => {
      const { categoryId } = getTestIds();
      const res = await request(app.getHttpServer())
        .get(`/api/v1/projects?category=test`)
        .expect(200);

      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('GET /projects/:slug', () => {
    it('should get project by slug', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/projects/test-project')
        .expect(200);

      expect(res.body.data).toHaveProperty('title', 'Test Project');
      expect(res.body.data).toHaveProperty('slug', 'test-project');
    });

    it('should return 404 for non-existent project', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/projects/does-not-exist')
        .expect(404);
    });
  });

  describe('POST /projects', () => {
    it('should create a project when authenticated', async () => {
      const token = getAuthToken();
      const res = await request(app.getHttpServer())
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'New Mod',
          description: 'A new mod for testing',
          body: 'Long description here',
        })
        .expect(201);

      expect(res.body.data).toHaveProperty('slug');
      expect(res.body.data.title).toBe('New Mod');
    });

    it('should reject unauthenticated creation', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/projects')
        .send({
          title: 'NoAuth',
          description: 'Should fail',
        })
        .expect(401);
    });

    it('should reject missing required fields', async () => {
      const token = getAuthToken();
      await request(app.getHttpServer())
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Only title' })
        .expect(400);
    });
  });

  describe('PATCH /projects/:id', () => {
    it('should update own project', async () => {
      const token = getAuthToken();
      const { projectId } = getTestIds();
      const res = await request(app.getHttpServer())
        .patch(`/api/v1/projects/${projectId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ description: 'Updated description' })
        .expect(200);

      expect(res.body.data.description).toBe('Updated description');
    });

    it('should reject other users updating', async () => {
      const { projectId } = getTestIds();
      const token2 = getAuthToken();
      await request(app.getHttpServer())
        .patch(`/api/v1/projects/${projectId}`)
        .set('Authorization', `Bearer ${token2}`)
        .send({ description: 'Should not work' })
        .expect(403);
    });
  });

  describe('GET /projects/:slug/dependencies', () => {
    it('should return dependencies list', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/projects/test-project/dependencies')
        .expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('GET /projects/:slug/team', () => {
    it('should return team list', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/projects/test-project/team')
        .expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('GET /projects/:slug/related', () => {
    it('should return related projects', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/projects/test-project/related')
        .expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('DELETE /projects/:id', () => {
    it('should delete own project', async () => {
      const token = getAuthToken();
      const { userId } = getTestIds();
      await request(app.getHttpServer())
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'To Delete',
          description: 'Will be deleted',
        })
        .expect(201)
        .then((res) => {
          return request(app.getHttpServer())
            .delete(`/api/v1/projects/${res.body.data.id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);
        });
    });
  });
});
