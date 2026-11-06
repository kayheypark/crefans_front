import {defineConfig,devices} from '@playwright/test';
import path from 'node:path';

// API mocked in the browser; no backend, payment, or production calls (2026-11-06 intermediary notice).
export default defineConfig({
 testDir:'.',testMatch:'legal-notices.spec.ts',workers:1,timeout:60000,expect:{timeout:15000},
 reporter:[['list'],['json',{outputFile:path.resolve(__dirname,'../test-results/legal-notices.json')}]],
 outputDir:path.resolve(__dirname,'../test-results/legal-notices'),
 use:{baseURL:'http://127.0.0.1:3021',trace:'retain-on-failure',screenshot:'only-on-failure'},
 projects:[{name:'pc',use:{...devices['Desktop Chrome']}},{name:'mobile',use:{...devices['iPhone 13']}}],
 webServer:{command:'npm run dev -- --hostname 127.0.0.1 --port 3021',cwd:path.resolve(__dirname,'..'),url:'http://127.0.0.1:3021/preview/checkout',reuseExistingServer:false,timeout:120000,env:{CREFANS_E2E:'true',PLATFORM_API_ORIGIN:'http://127.0.0.1:3022'}},
});
