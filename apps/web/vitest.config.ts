import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/*.{test,spec}.{ts,tsx}'],
    css: false,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      '@mcp/ui': path.resolve(__dirname, '../../packages/ui'),
      '@mcp/types': path.resolve(__dirname, '../../packages/types/src'),
      '@mcp/utils': path.resolve(__dirname, '../../packages/utils/src'),
      '@mcp/auth': path.resolve(__dirname, '../../packages/auth/src'),
      '@mcp/sdk': path.resolve(__dirname, '../../packages/sdk/src'),
    },
  },
});
