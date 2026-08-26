import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { setupTestApp, teardownTestApp, cleanDatabase, seedTestData } from './test-helpers';

describe('Version Files (hash lookup) E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await setupTestApp();
    await cleanDatabase();
    await seedTestData();
  });

  afterAll(async () => {
    await teardownTestApp();
  });

  describe('GET /version_file/:algorithm/:hash', () => {
    it.skip('should return a version by its sha1 hash (requires controller)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/version_file/sha1/da39a3ee5e6b4b0d3255bfef95601890afd80709')
        .expect(200);
      expect(res.body.data).toHaveProperty('fileUrl');
    });

    it.skip('should return 404 for an unknown hash', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/version_file/sha1/0000000000000000000000000000000000000000')
        .expect(404);
    });
  });

  describe('GET /version_file/:hash/update', () => {
    it.skip('should return the latest matching version (requires controller)', async () => {
      const res = await request(app.getHttpServer())
        .get(
          '/api/v1/version_file/da39a3ee5e6b4b0d3255bfef95601890afd80709/update?loaders=fabric&game_versions=1.21.1',
        )
        .expect(200);
      expect(res.body.data).toHaveProperty('fileUrl');
    });
  });

  describe('GET /version_files', () => {
    it.skip('should return multiple versions by hash list (requires controller)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/version_files?algorithm=sha1&hashes=da39a3ee5e6b4b0d3255bfef95601890afd80709')
        .expect(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });
});
