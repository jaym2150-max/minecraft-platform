import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  setupTestApp,
  teardownTestApp,
  cleanDatabase,
  seedTestData,
  getApp,
  getAuthToken,
  getAdminToken,
  getTestIds,
} from './test-helpers';

describe('Notifications E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await setupTestApp();
    await cleanDatabase();
    await seedTestData();
  });

  afterAll(async () => {
    await teardownTestApp();
  });

  describe('GET /notifications', () => {
    it('should list notifications for the user', async () => {
      const token = getAuthToken();
      const res = await request(app.getHttpServer())
        .get('/api/v1/notifications')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should reject unauthenticated', async () => {
      await request(app.getHttpServer()).get('/api/v1/notifications').expect(401);
    });
  });

  describe('POST /notifications/read-all', () => {
    it('should mark all notifications as read', async () => {
      const token = getAuthToken();
      const res = await request(app.getHttpServer())
        .post('/api/v1/notifications/read-all')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body).toHaveProperty('data');
    });
  });
});

describe('Moderation E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await setupTestApp();
    await cleanDatabase();
    await seedTestData();
  });

  afterAll(async () => {
    await teardownTestApp();
  });

  describe('POST /moderation/reports', () => {
    it('should accept a report from any user', async () => {
      const token = getAuthToken();
      const { user2Id } = getTestIds();
      const res = await request(app.getHttpServer())
        .post('/api/v1/moderation/reports')
        .set('Authorization', `Bearer ${token}`)
        .send({
          reportedId: user2Id,
          type: 'user',
          reason: 'Testing report',
          description: 'This is a test report',
        })
        .expect(201);

      expect(res.body.data).toHaveProperty('status', 'PENDING');
    });
  });

  describe('GET /moderation/reports', () => {
    it('should list reports for moderators', async () => {
      const token = getAdminToken();
      const res = await request(app.getHttpServer())
        .get('/api/v1/moderation/reports')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body).toHaveProperty('data');
    });

    it('should reject non-moderator access', async () => {
      const token = getAuthToken();
      await request(app.getHttpServer())
        .get('/api/v1/moderation/reports')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
    });
  });

  describe('GET /moderation/reports/stats', () => {
    it('should return stats for moderators', async () => {
      const token = getAdminToken();
      const res = await request(app.getHttpServer())
        .get('/api/v1/moderation/reports/stats')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.data).toHaveProperty('pending');
      expect(res.body.data).toHaveProperty('resolved');
    });
  });
});

describe('Analytics E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await setupTestApp();
    await cleanDatabase();
    await seedTestData();
  });

  afterAll(async () => {
    await teardownTestApp();
  });

  describe('GET /analytics/user', () => {
    it('should return user analytics', async () => {
      const token = getAuthToken();
      const res = await request(app.getHttpServer())
        .get('/api/v1/analytics/user?period=30d')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.data).toHaveProperty('summary');
      expect(res.body.data.summary).toHaveProperty('totalProjects');
    });
  });

  describe('GET /analytics/platform', () => {
    it('should require admin role', async () => {
      const token = getAuthToken();
      await request(app.getHttpServer())
        .get('/api/v1/analytics/platform')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
    });

    it('should return platform analytics for admin', async () => {
      const token = getAdminToken();
      const res = await request(app.getHttpServer())
        .get('/api/v1/analytics/platform')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.data).toHaveProperty('summary');
      expect(res.body.data.summary).toHaveProperty('totalUsers');
    });
  });
});
