/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@mcp/ui', '@mcp/utils', '@mcp/types'],
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9000',
      },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
};

module.exports = nextConfig;
