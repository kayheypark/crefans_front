import {defineConfig,devices} from '@playwright/test';
import path from 'node:path';

// Preview models only; no backend, payment, or production mutations.
export default defineConfig({
 testDir:'.',testMatch:'membership-upload.spec.ts',workers:1,timeout:45000,expect:{timeout:10000},
 reporter:[['list'],['json',{outputFile:path.resolve(__dirname,'../test-results/membership-upload.json')}]],
 outputDir:path.resolve(__dirname,'../test-results/membership-upload'),
 use:{baseURL:'http://127.0.0.1:3011',trace:'retain-on-failure',screenshot:'only-on-failure'},
 projects:[{name:'pc',use:{...devices['Desktop Chrome']}},{name:'mobile',use:{...devices['iPhone 13']}}],
 webServer:{command:'npm run dev -- --hostname 127.0.0.1 --port 3011',cwd:path.resolve(__dirname,'..'),url:'http://127.0.0.1:3011/preview/studio/memberships',reuseExistingServer:false,timeout:120000,env:{CREFANS_E2E:'true',PLATFORM_API_ORIGIN:'http://127.0.0.1:3012'}},
});
