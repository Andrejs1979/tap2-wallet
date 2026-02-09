import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'miniflare', // Use miniflare for Cloudflare Workers testing
    include: ['src/**/*.test.ts'],
    pool: 'threads',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{js,ts}'],
      exclude: ['node_modules/', 'dist/', '**/*.test.ts', '**/*.spec.ts', 'drizzle/'],
    },
    // Setup files for Cloudflare Workers environment
    setupFiles: ['./src/test/setup.ts'],
  },
});
