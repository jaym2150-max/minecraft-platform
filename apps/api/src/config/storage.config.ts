import { registerAs } from '@nestjs/config';

export default registerAs('storage', () => ({
  endpoint: process.env.S3_ENDPOINT || 'http://localhost:9000',
  region: process.env.S3_REGION || 'us-east-1',
  accessKey: process.env.S3_ACCESS_KEY || 'mcp_access_key',
  secretKey: process.env.S3_SECRET_KEY || 'mcp_secret_key',
  bucket: process.env.S3_BUCKET || 'uploads',
  publicBucket: process.env.S3_PUBLIC_BUCKET || 'public',
}));
