import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './e2e',
    timeout: 60000,
    retries: 0,
    use: {
        headless: true,
        viewport: { width: 1280, height: 720 },
        actionTimeout: 10000,
    },
    webServer: {
        command: 'npx http-server dist -p 8086 -s',
        port: 8086,
        reuseExistingServer: true,
    },
});
