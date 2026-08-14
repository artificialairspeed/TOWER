import { defineConfig, devices } from '@playwright/test';

/**
 * Browser Compatibility Test Configuration
 * 
 * Tests the application across multiple browsers:
 * - Chrome 90+ (Chromium)
 * - Firefox 88+
 * - Safari 14+
 * - Edge 90+ (Chromium-based)
 * 
 * Task 22.3 Requirements:
 * - Test on Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
 * - Verify date/time pickers work correctly across browsers
 * - Verify PDF/PNG generation works across browsers
 * - Verify download behavior consistent across browsers
 * - Document any browser-specific issues or limitations
 */

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.spec.ts',
  
  /* Run tests in files in parallel */
  fullyParallel: false,
  
  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,
  
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  
  /* Opt out of parallel tests on CI */
  workers: process.env.CI ? 1 : undefined,
  
  /* Reporter to use */
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results.json' }],
    ['list'],
    ['junit', { outputFile: 'test-results.xml' }],
  ],

  /* Shared settings for all the projects below */
  use: {
    /* Base URL to use in actions like `await page.goto('/')` */
    baseURL: 'http://localhost:5173',
    
    /* Collect trace when retrying the failed test */
    trace: 'on-first-retry',
    
    /* Screenshot on failure */
    screenshot: 'only-on-failure',
    
    /* Video on failure */
    video: 'retain-on-failure',
  },

  /* Configure projects for major browsers and versions */
  projects: [
    // Chromium-based browsers (Chrome, Edge)
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Emulate Chrome 90+
        channel: 'chrome',
      },
    },

    {
      name: 'chrome',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
      },
    },

    {
      name: 'edge',
      use: {
        ...devices['Desktop Edge'],
        channel: 'msedge',
      },
    },

    // Firefox 88+
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
      },
    },

    // Safari 14+
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
      },
    },

    // Safari on iPad for additional mobile testing
    {
      name: 'iPad',
      use: {
        ...devices['iPad Pro'],
      },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },

  /* Global timeout */
  timeout: 30000,
  
  /* Expect timeout */
  expect: {
    timeout: 5000,
  },
});
