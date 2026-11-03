import { existsSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const privateDir = fileURLToPath(new URL('./private-data', import.meta.url));
const demoDir = fileURLToPath(new URL('./src/common/data/demo', import.meta.url));

// Real data lives in git-ignored private-data/. Demo data is used when it is absent,
// when DATA_MODE=demo (public builds), and under tests.
const useDemo =
  process.env.DATA_MODE === 'demo' || !!process.env.VITEST || !existsSync(`${privateDir}/expenseRecords.json`);

console.log(`[data] using ${useDemo ? 'DEMO (fictional)' : 'PRIVATE'} data`);

export default defineConfig({
  // GitHub Pages serves the site from /<repo-name>/, so the deploy workflow sets BASE_PATH.
  base: process.env.BASE_PATH ?? '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@data': useDemo ? demoDir : privateDir,
    },
  },
  test: { environment: 'node', include: ['src/**/*.test.ts'] },
});
