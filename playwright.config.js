import { defineConfig } from '@playwright/test';
import { existsSync } from 'node:fs';

const executablePath = process.env.CHROMIUM_PATH || (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined);
export default defineConfig({
  testDir: './tests/browser',
  workers: 2,
  fullyParallel: true,
  timeout: 30000,
  use: {
    baseURL: 'http://127.0.0.1:8010',
    launchOptions: { executablePath },
    trace: 'retain-on-failure'
  },
  webServer: {
    command: 'python3 -m http.server 8010 --bind 127.0.0.1',
    url: 'http://127.0.0.1:8010',
    stdout: 'ignore',
    stderr: 'ignore',
    reuseExistingServer: !process.env.CI
  }
});
