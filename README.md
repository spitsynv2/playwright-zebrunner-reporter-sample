# Playwright samples using Zebrunner reporter

Sample Playwright project that reports results with [`@zebrunner/javascript-agent-playwright`](https://www.npmjs.com/package/@zebrunner/javascript-agent-playwright).

## Setup

```bash
cd playwright
npm install
npx playwright install
```

## Run

```bash
cd playwright
npm test
```

To send results to Zebrunner, set reporting env vars (see `playwright/playwright.config.js`), for example:

```bash
REPORTING_ENABLED=true \
REPORTING_PROJECT_KEY=DEF \
REPORTING_SERVER_HOSTNAME=https://yourCompany.zebrunner.com \
REPORTING_SERVER_ACCESS_TOKEN=yourAccessToken \
npm test
```
