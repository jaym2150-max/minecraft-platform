import { McpSDK } from '@mcp/sdk';

export const sdk = new McpSDK(
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1',
);
