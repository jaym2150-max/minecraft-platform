import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  const username = process.argv[3];

  if (!email || !username) {
    console.error('Usage: ts-node scripts/create-admin.ts <email> <username>');
    process.exit(1);
  }

  const password = await bcrypt.hash('admin123', 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: { role: 'ADMIN' },
    create: {
      email,
      username,
      passwordHash: password,
      role: 'ADMIN',
      emailVerified: true,
    },
  });

  console.log(`Admin user created: ${user.username} (${user.email})`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
