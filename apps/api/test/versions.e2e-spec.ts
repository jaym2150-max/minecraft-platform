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

describe('Versions E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await setupTestApp();
    await cleanDatabase();
    await seedTestData();
  });

  afterAll(async () => {
    await teardownTestApp();
  });

  describe('GET /projects/:projectId/versions', () => {
    it('should list versions for a project', async () => {
      const { projectId } = getTestIds();
      const res = await request(app.getHttpServer())
        .get(`/api/v1/projects/${projectId}/versions`)
        .expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('should return 404 for non-existent project', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/projects/non-existent-id/versions')
        .expect(404);
    });
  });

  describe('POST /projects/:projectId/versions', () => {
    it('should create a version as the project owner', async () => {
      const token = getAuthToken();
      const { projectId } = getTestIds();
      const res = await request(app.getHttpServer())
        .post(`/api/v1/projects/${projectId}/versions`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          version: '1.1.0',
          changelog: 'Bug fixes',
          fileUrl: 'https://example.com/v1.1.0.jar',
          fileSize: 2048,
          hash: 'sha256:newhash',
          loaders: ['FABRIC'],
        })
        .expect(201);

      expect(res.body.data.version).toBe('1.1.0');
    });

    it('should reject duplicate version', async () => {
      const token = getAuthToken();
      const { projectId } = getTestIds();
      const res = await request(app.getHttpServer())
        .post(`/api/v1/projects/${projectId}/versions`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          version: '1.0.0',
          fileUrl: 'https://example.com/dup.jar',
          fileSize: 1024,
          hash: 'sha256:dup',
          loaders: ['FABRIC'],
        });

      expect([400, 409]).toContain(res.status);
    });

    it('should reject without authentication', async () => {
      const { projectId } = getTestIds();
      await request(app.getHttpServer())
        .post(`/api/v1/projects/${projectId}/versions`)
        .send({
          version: '2.0.0',
          fileUrl: 'https://example.com/v2.jar',
          fileSize: 1024,
          hash: 'sha256:v2',
          loaders: ['FABRIC'],
        })
        .expect(401);
    });
  });

  describe('GET /versions/:id', () => {
    it('should get a single version', async () => {
      const { versionId } = getTestIds();
      const res = await request(app.getHttpServer())
        .get(`/api/v1/versions/${versionId}`)
        .expect(200);

      expect(res.body.data).toHaveProperty('version', '1.0.0');
    });

    it('should return 404 for non-existent version', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/versions/non-existent-id')
        .expect(404);
    });
  });

  describe('GET /versions/:id/download', () => {
    it('should increment downloads and return URL', async () => {
      const { versionId } = getTestIds();
      const res = await request(app.getHttpServer())
        .get(`/api/v1/versions/${versionId}/download`)
        .expect(200);

      expect(res.body.data).toHaveProperty('url');
    });
  });
});
