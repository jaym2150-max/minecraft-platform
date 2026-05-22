import { execSync } from 'child_process';

try {
  execSync('prisma migrate dev', { stdio: 'inherit', cwd: 'apps/api' });
} catch (error) {
  console.error('Migration failed:', error);
  process.exit(1);
}
