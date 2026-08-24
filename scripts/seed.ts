import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DELETED_USER_ID = '00000000-0000-0000-0000-000000000000';

async function main() {
  console.log('Seeding database...');

  await prisma.user.upsert({
    where: { id: DELETED_USER_ID },
    update: {},
    create: {
      id: DELETED_USER_ID,
      username: 'deleted',
      email: 'deleted@minecraftplatform.local',
      passwordHash: await bcrypt.hash(cryptoRandom(), 12),
      displayName: '[Deleted User]',
      role: UserRole.USER,
    },
  });

  await prisma.user.upsert({
    where: { email: 'admin@minecraftplatform.local' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@minecraftplatform.local',
      passwordHash: await bcrypt.hash(process.env.SEED_ADMIN_PWD || 'ChangeMe@12345', 10),
      displayName: 'Admin',
      role: UserRole.ADMIN,
    },
  });

  await prisma.user.upsert({
    where: { email: 'testuser@minecraftplatform.local' },
    update: {},
    create: {
      username: 'testuser',
      email: 'testuser@minecraftplatform.local',
      passwordHash: await bcrypt.hash(process.env.SEED_USER_PWD || 'ChangeMe@12345', 10),
      displayName: 'Test User',
      role: UserRole.USER,
    },
  });

  const categories = [
    { name: 'Adventure', slug: 'adventure', description: 'Adventure mods', color: '#e74c3c' },
    { name: 'Technology', slug: 'technology', description: 'Technology mods', color: '#3498db' },
    { name: 'Magic', slug: 'magic', description: 'Magic mods', color: '#9b59b6' },
    { name: 'Utility', slug: 'utility', description: 'Utility mods', color: '#2ecc71' },
    { name: 'Library', slug: 'library', description: 'Library mods', color: '#f39c12' },
    { name: 'World Gen', slug: 'world-gen', description: 'World generation mods', color: '#1abc9c' },
    { name: 'Food', slug: 'food', description: 'Food and cooking mods', color: '#e67e22' },
    { name: 'Storage', slug: 'storage', description: 'Storage mods', color: '#95a5a6' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  console.log('Database seeded successfully!');
}

function cryptoRandom(): string {
  const { randomBytes } = require('crypto');
  return randomBytes(32).toString('hex');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
