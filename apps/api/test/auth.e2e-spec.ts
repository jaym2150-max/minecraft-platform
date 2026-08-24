import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { setupTestApp, teardownTestApp, cleanDatabase, seedTestData, getApp, getAuthToken } from './test-helpers';

describe('Auth E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await setupTestApp();
    await cleanDatabase();
    await seedTestData();
  });

  afterAll(async () => {
    await teardownTestApp();
  });

  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          username: 'newuser',
          email: 'newuser@example.com',
          password: 'NewP@ss123',
        })
        .expect(201);

      expect(res.body).toHaveProperty('data');
      expect(res.body.data.user).toHaveProperty('username', 'newuser');
      expect(res.body.data.user).toHaveProperty('email', 'newuser@example.com');
    });

    it('should reject duplicate email', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          username: 'another',
          email: 'newuser@example.com',
          password: 'AnotherP@ss123',
        });

      expect([400, 409]).toContain(res.status);
    });

    it('should reject weak password', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          username: 'weakpw',
          email: 'weak@example.com',
          password: 'weak',
        });

      expect(res.status).toBe(400);
    });

    it('should reject invalid email', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          username: 'bademail',
          email: 'not-an-email',
          password: 'ValidP@ss123',
        });

      expect(res.status).toBe(400);
    });

    it('should reject invalid username', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          username: 'ab',
          email: 'short@example.com',
          password: 'ValidP@ss123',
        });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /auth/login', () => {
    it('should login with valid credentials', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'test@example.com', password: 'TestP@ss123' })
        .expect(200);

      expect(res.body).toHaveProperty('user');
      expect(res.body).toHaveProperty('accessToken');
    });

    it('should reject wrong password', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'test@example.com', password: 'WrongPassword' });

      expect(res.status).toBe(401);
    });

    it('should reject non-existent user', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'nobody@example.com', password: 'AnyP@ss123' });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /auth/me', () => {
    it('should return current user with valid token', async () => {
      const token = getAuthToken();
      const res = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body).toHaveProperty('username', 'testuser');
    });

    it('should reject request without token', async () => {
      await request(app.getHttpServer()).get('/api/v1/auth/me').expect(401);
    });

    it('should reject invalid token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('POST /auth/logout', () => {
    it('should logout with valid token', async () => {
      const token = getAuthToken();
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.message).toMatch(/logged out/i);
    });
  });

  describe('POST /auth/forgot-password', () => {
    it('should accept any email without leaking', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/forgot-password')
        .send({ email: 'test@example.com' });

      expect([200, 202]).toContain(res.status);
    });

    it('should reject missing email', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/forgot-password')
        .send({})
        .expect(400);
    });
  });
});
