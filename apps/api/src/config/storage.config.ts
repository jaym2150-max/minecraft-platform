import { registerAs } from '@nestjs/config';
import { requireEnv } from '../common/env';

export default registerAs('storage', () => ({
  endpoint: process.env.S3_ENDPOINT || 'http://localhost:9000',
  region: process.env.S3_REGION || 'us-east-1',
  accessKey: requireEnv('S3_ACCESS_KEY', process.env.S3_ACCESS_KEY, ''),
  secretKey: requireEnv('S3_SECRET_KEY', process.env.S3_SECRET_KEY, ''),
  bucket: process.env.S3_BUCKET || 'uploads',
  publicBucket: process.env.S3_PUBLIC_BUCKET || 'public',
}));
