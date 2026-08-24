/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@mcp/ui', '@mcp/utils', '@mcp/types', '@mcp/auth', '@mcp/sdk'],
  basePath: '/admin',
  env: {
    API_URL: process.env.API_URL || 'http://localhost:4000',
    WEB_URL: process.env.WEB_URL || 'http://localhost:3003',
  },
};
module.exports = nextConfig;
