/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@mcp/ui', '@mcp/utils', '@mcp/types', '@mcp/auth', '@mcp/sdk'],
  basePath: '/admin',
  env: {
    API_URL: process.env.API_URL || 'http://localhost:4000',
    WEB_URL: process.env.WEB_URL || 'http://localhost:3003',
  },
  async rewrites() {
    // Client-side fetches go to /api/v1/* (unprefixed — with basePath
    // configured, rewrite sources match the path WITHOUT the basePath) and
    // are proxied to the NestJS API. Same-origin, so the auth cookie rides
    // along. In production nginx routes /api/v1/* to the API anyway.
    return [
      {
        source: '/api/v1/:path*',
        basePath: false,
        destination: `${process.env.API_URL || 'http://localhost:4000'}/api/v1/:path*`,
      },
    ];
  },
};
module.exports = nextConfig;
