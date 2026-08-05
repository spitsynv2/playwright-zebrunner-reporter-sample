const { defineConfig, devices } = require('@playwright/test');

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

const ENGINE_MAP = { chrome: 'chromium', msedge: 'chromium', firefox: 'firefox', webkit: 'webkit' };
const DEVICE_MAP = { chromium: 'Desktop Chrome', firefox: 'Desktop Firefox', webkit: 'Desktop Safari' };
const CHANNEL_MAP = { chrome: 'chrome', msedge: 'msedge' };

let browserEngine = 'chromium';
let browserName = 'chromium';
let browserVersion = undefined;
let channel = undefined;
if (process.env.ZEBRUNNER_CAPABILITIES) {
  try {
    const caps = JSON.parse(process.env.ZEBRUNNER_CAPABILITIES);
    if (caps.browserName) {
      browserName = caps.browserName;
      browserEngine = ENGINE_MAP[caps.browserName] || 'chromium';
      channel = CHANNEL_MAP[caps.browserName];
    }
    if (caps.browserVersion) {
      browserVersion = caps.browserVersion;
    }
  } catch (e) { /* ignore parse errors */ }
}

const devicePreset = devices[DEVICE_MAP[browserEngine] || 'Desktop Chrome'];
let userAgent = devicePreset.userAgent;
if (browserVersion && userAgent && /^\d+/.test(browserVersion)) {
  userAgent = userAgent.replace(/Chrome\/[\d.]+/, `Chrome/${browserVersion}`);
}

const parsedWorkers = Number.parseInt(process.env.PW_WORKERS || '', 10);
const workers = Number.isFinite(parsedWorkers) && parsedWorkers > 0 ? parsedWorkers : undefined;
const fullyParallel = process.env.PW_FULLY_PARALLEL === 'false' ? false : true;
const lightReport = process.env.PW_LIGHT_REPORT !== 'false';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
module.exports = defineConfig({
  testDir: './test',
  fullyParallel,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers,

  use: {
    trace: lightReport ? 'off' : 'on-first-retry',
    screenshot: 'on',
    video: 'on',
  },

  projects: [
    {
      name: browserName,
      use: {
        ...devicePreset,
        ...(userAgent ? { userAgent } : {}),
        ...(channel ? { channel } : {}),
        launchOptions: {
          args: browserEngine === 'firefox'
            ? ['-no-remote']
            : ['--no-sandbox'],
          firefoxUserPrefs: browserEngine === 'firefox'
            ? { 'security.sandbox.content.level': 0 }
            : undefined,
        },
      },
    },

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

reporter: [[
  '@zebrunner/javascript-agent-playwright',
  {
    enabled: true,
    projectKey: 'DEF',
    server: {
      hostname: process.env.REPORTING_SERVER_HOSTNAME,
      accessToken: process.env.REPORTING_SERVER_ACCESS_TOKEN,
    },
    launch: {
      displayName: 'Chrome WEB',
      build: '1.0',
      treatSkipsAsFailures: false,
    },
    logs: {
      format: 'playwright-title',
      includeDuration: false,
      includeLocation: false,
      maxSourceLines: 5,
      maxMessageLength: 8000,
      ignorePlaywrightSteps: false,
      ignoreConsole: false,
      ignoreCustom: false,
      ignoreManualScreenshots: false,
      ignoreAutoScreenshots: false,
      pushInRealTime: true,
      pushResults: false,
    },
  },
]],
});
