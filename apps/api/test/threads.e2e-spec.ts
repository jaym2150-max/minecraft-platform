import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  setupTestApp,
  teardownTestApp,
  cleanDatabase,
  seedTestData,
  getAuthToken,
} from './test-helpers';

describe('Threads E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await setupTestApp();
    await cleanDatabase();
    await seedTestData();
  });

  afterAll(async () => {
    await teardownTestApp();
  });

  describe('GET /threads/mine', () => {
    it.skip('should return threads the user participates in (requires controller)', async () => {
      const token = getAuthToken();
      const res = await request(app.getHttpServer())
        .get('/api/v1/threads/mine')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('Thread create + message flow', () => {
    it.skip('should create a thread, fetch it, and send a message (requires controllers)', async () => {
      const token = getAuthToken();
      const create = await request(app.getHttpServer())
        .post('/api/v1/threads')
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'DIRECT_MESSAGE',
          title: 'Hello world',
          participants: [],
        })
        .expect(201);

      const threadId = create.body.data.id;

      await request(app.getHttpServer())
        .get(`/api/v1/threads/${threadId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const msg = await request(app.getHttpServer())
        .post(`/api/v1/threads/${threadId}/messages`)
        .set('Authorization', `Bearer ${token}`)
        .send({ body: 'Hi from the test' })
        .expect(201);

      expect(msg.body.data).toHaveProperty('body', 'Hi from the test');
    });
  });
});
