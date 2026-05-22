import { execSync } from 'child_process';

console.log('Generating Prisma types...');
execSync('prisma generate', { stdio: 'inherit', cwd: 'apps/api' });
console.log('Types generated successfully!');
