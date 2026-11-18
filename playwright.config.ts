import fs from 'node:fs';
import { defineConfig } from '@playwright/test';

process.env.PW_TEST_SCREENSHOT_NO_FONTS_READY ??= '1';

const defaultMacChromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const resolvedChromePath =
  process.env.HYPERBUDS_CHROME_PATH ||
  (process.platform === 'darwin' && fs.existsSync(defaultMacChromePath) ? defaultMacChromePath : undefined);

export default defineConfig({
  testDir: './tests/browser',
  workers: 1,
  expect: { timeout: 60_000 },
  timeout: 120_000,
  use: {
    baseURL: 'http://127.0.0.1:3100',
    actionTimeout: 15_000,
    serviceWorkers: 'block',
    reducedMotion: 'reduce',
    launchOptions: resolvedChromePath ? { executablePath: resolvedChromePath } : {},
  },
  webServer: {
    command: 'npm run dev -- --hostname 127.0.0.1 --port 3100',
    url: 'http://127.0.0.1:3100/auth/signin',
    timeout: 600_000,
    reuseExistingServer: false,
    env: { NEXT_DIST_DIR: '.next-pw.nosync', NEXT_TELEMETRY_DISABLED: '1', NEXT_PUBLIC_API_URL: 'http://127.0.0.1:49999', NEXT_PUBLIC_BASE_URL: 'http://127.0.0.1:49999', NEXT_PUBLIC_API_BASE_URL: 'http://127.0.0.1:49999/api/v1' },
  },
});
