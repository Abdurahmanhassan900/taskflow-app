import { defineConfig, devices } from '@playwright/test';

const backendEnv = {
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://taskuser:taskpass@localhost:5432/taskdb',
  JWT_SECRET: process.env.JWT_SECRET || 'e2e_access_secret_at_least_32_characters_long',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'e2e_refresh_secret_at_least_32_chars',
  ALLOWED_ORIGIN: 'http://localhost:5173',
  NODE_ENV: 'development',
  PORT: '3000',
};

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  timeout: 60_000,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'npm run start',
      cwd: './backend',
      url: 'http://localhost:3000/health',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: backendEnv,
    },
    {
      command: 'npm run dev -- --host 127.0.0.1 --port 5173',
      cwd: './frontend',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        VITE_API_URL: 'http://localhost:3000/api/v1',
      },
    },
  ],
});
