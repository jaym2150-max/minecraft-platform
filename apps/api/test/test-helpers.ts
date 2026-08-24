import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma/prisma.service';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';

export const TEST_USER = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'TestP@ss123',
};

export const TEST_USER_2 = {
  username: 'testuser2',
  email: 'test2@example.com',
  password: 'TestP@ss456',
};

export const TEST_ADMIN = {
  username: 'admin_test',
  email: 'admin@example.com',
  password: 'AdminP@ss123',
  role: 'OWNER',
};

let app: INestApplication;
let prisma: PrismaService;
let testUserId: string;
let testUser2Id: string;
let testAdminId: string;
let authToken: string;
let authToken2: string;
let adminToken: string;
let testProjectId: string;
let testVersionId: string;
let testCategoryId: string;

export async function setupTestApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleFixture.createNestApplication();
  app.setGlobalPrefix('api/v1', { exclude: ['health'] });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  prisma = app.get(PrismaService);
  await prisma.$connect();

  await app.init();
  return app;
}

export async function teardownTestApp() {
  if (prisma) {
    await cleanDatabase();
    await prisma.$disconnect();
  }
  if (app) {
    await app.close();
  }
}

export async function cleanDatabase() {
  if (!prisma) return;
  await prisma.download.deleteMany({});
  await prisma.report.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.dependency.deleteMany({});
  await prisma.loader.deleteMany({});
  await prisma.projectVersion.deleteMany({});
  await prisma.teamMember.deleteMany({});
  await prisma.team.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.minecraftVersion.deleteMany({});
  await prisma.user.deleteMany({});
}

export async function seedTestData() {
  const bcrypt = await import('bcryptjs');

  const user1 = await prisma.user.create({
    data: {
      username: TEST_USER.username,
      email: TEST_USER.email,
      passwordHash: await bcrypt.hash(TEST_USER.password, 10),
      emailVerified: true,
    },
  });
  testUserId = user1.id;

  const user2 = await prisma.user.create({
    data: {
      username: TEST_USER_2.username,
      email: TEST_USER_2.email,
      passwordHash: await bcrypt.hash(TEST_USER_2.password, 10),
      emailVerified: true,
    },
  });
  testUser2Id = user2.id;

  const admin = await prisma.user.create({
    data: {
      username: TEST_ADMIN.username,
      email: TEST_ADMIN.email,
      passwordHash: await bcrypt.hash(TEST_ADMIN.password, 10),
      emailVerified: true,
      role: TEST_ADMIN.role as any,
    },
  });
  testAdminId = admin.id;

  const category = await prisma.category.create({
    data: { name: 'Test', slug: 'test', description: 'Test category' },
  });
  testCategoryId = category.id;

  const mcVersion = await prisma.minecraftVersion.create({
    data: { version: '1.21.1', type: 'release', stable: true },
  });

  const project = await prisma.project.create({
    data: {
      title: 'Test Project',
      slug: 'test-project',
      description: 'A test project',
      body: 'Test body',
      authorId: testUserId,
      categoryId: testCategoryId,
      status: 'PUBLISHED',
    },
  });
  testProjectId = project.id;

  const version = await prisma.projectVersion.create({
    data: {
      projectId: testProjectId,
      version: '1.0.0',
      fileUrl: 'https://example.com/test.jar',
      fileSize: 1024,
      hash: 'sha256:test',
      status: 'APPROVED',
    },
  });
  testVersionId = version.id;

  // Get tokens
  const loginRes1 = await request(app.getHttpServer())
    .post('/api/v1/auth/login')
    .send({ email: TEST_USER.email, password: TEST_USER.password });
  authToken = loginRes1.body.data?.token ?? loginRes1.body.accessToken;

  const loginRes2 = await request(app.getHttpServer())
    .post('/api/v1/auth/login')
    .send({ email: TEST_USER_2.email, password: TEST_USER_2.password });
  authToken2 = loginRes2.body.data?.token ?? loginRes2.body.accessToken;

  const loginRes3 = await request(app.getHttpServer())
    .post('/api/v1/auth/login')
    .send({ email: TEST_ADMIN.email, password: TEST_ADMIN.password });
  adminToken = loginRes3.body.data?.token ?? loginRes3.body.accessToken;
}

export const getApp = () => app;
export const getPrisma = () => prisma;
export const getAuthToken = () => authToken;
export const getAuthToken2 = () => authToken2;
export const getAdminToken = () => adminToken;
export const getTestIds = () => ({
  userId: testUserId,
  user2Id: testUser2Id,
  adminId: testAdminId,
  projectId: testProjectId,
  versionId: testVersionId,
  categoryId: testCategoryId,
});
