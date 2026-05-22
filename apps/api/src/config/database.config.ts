import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  url: process.env.DATABASE_URL || 'postgresql://mcp:mcp@localhost:5432/minecraft_platform',
}));
